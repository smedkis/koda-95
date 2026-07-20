import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getTerminRowBySlug, programKeyToShort, publicTerminHref, terminSlug } from "./termini";
import { syncNarocnikFromRegistration } from "./narocniki";
import type { PrijaveRow, TerminiRow, VozniciRow } from "@/lib/supabase/database.types";
import type { TerminDriver } from "@/components/admin/AdminTerminDriversTable";
import { dmyToIso, formatDateTimeSl, isoToDmy } from "@/lib/date-format";
import {
  buildTerminTitle,
  formatPriceEur,
  formatSlovenianDate,
  formatTimeRange,
} from "@/lib/termini-format";
import { sendEmail } from "@/lib/email/resend";
import {
  buildFormReminderEmail,
  buildQuickRegistrationEmail,
  getLogoAttachment,
} from "@/lib/email/templates";
import { getSiteUrl } from "@/lib/site-url";

// Admin has no i18n (single language, no locale switcher) — registrations
// added here always email in Slovenian, unlike the public quick-form path
// which sends in whatever locale the visitor was using.
const ADMIN_LOCALE = "sl";

type JoinedPrijava = PrijaveRow & { vozniki: VozniciRow };

function toTerminDriver(row: JoinedPrijava, priceEur: number | null): TerminDriver {
  const v = row.vozniki;
  // licence_categories is only ever written by completeRegistration, so its
  // presence alone reliably means the /obrazec form was finished — unlike
  // consent_terms, which the admin's manual "Dodaj voznik" flow never sets
  // at all (no consent checkbox there), so gating on it would keep every
  // admin-added driver's form status stuck at "not completed" forever.
  const hasForm = !!row.licence_categories && row.licence_categories.length > 0;

  return {
    id: row.id,
    driverName: v.full_name,
    email: v.email ?? undefined,
    phone: v.phone ?? undefined,
    registrationDate: isoToDmy(row.created_at),
    dateOfBirth: v.date_of_birth ? isoToDmy(v.date_of_birth) : undefined,
    birthPlace: v.place_of_birth ?? undefined,
    birthCountry: v.country_of_birth ?? undefined,
    citizenship: v.citizenship ?? undefined,
    emso: v.emso ?? undefined,
    residenceType: v.residence_type ?? undefined,
    streetAddress: v.street_address ?? undefined,
    postalCode: v.postal_code ?? undefined,
    city: v.city ?? undefined,
    categoryC: row.licence_categories?.includes("C") ?? false,
    categoryD: row.licence_categories?.includes("D") ?? false,
    paymentMethod: row.payer_type === "company" ? "Nakazilo (podjetje)" : "Nakazilo",
    paymentAmount: priceEur !== null ? `${priceEur} EUR` : undefined,
    paymentReference: row.registration_code,
    formStatus: hasForm ? "izpolnjen" : "manjka",
    paymentStatus: row.payment_status === "paid" ? "poravnano" : "caka",
    payer: row.payer_type === "self" ? "sam" : (row.company_name ?? "Podjetje"),
  };
}

export async function getRegistrationsForTermin(terminSlug: string): Promise<TerminDriver[]> {
  const termin = await getTerminRowBySlug(terminSlug);
  if (!termin) return [];

  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from("prijave")
    .select("*, vozniki(*)")
    .eq("termin_id", termin.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (data as unknown as JoinedPrijava[]).map((row) => toTerminDriver(row, termin.price_eur));
}

export async function getRegistration(
  terminSlug: string,
  registrationId: string,
): Promise<TerminDriver | null> {
  const termin = await getTerminRowBySlug(terminSlug);
  if (!termin) return null;

  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from("prijave")
    .select("*, vozniki(*)")
    .eq("id", registrationId)
    .eq("termin_id", termin.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const driver = toTerminDriver(data as unknown as JoinedPrijava, termin.price_eur);
  driver.events = await getRegistrationEvents(registrationId);
  return driver;
}

async function getRegistrationEvents(
  prijavaId: string,
): Promise<{ message: string; timestamp: string }[]> {
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from("prijava_dogodki")
    .select("message, created_at")
    .eq("prijava_id", prijavaId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    message: row.message,
    timestamp: formatDateTimeSl(row.created_at),
  }));
}

export async function logRegistrationEvent(prijavaId: string, message: string): Promise<void> {
  const client = getSupabaseServerClient();
  await client.from("prijava_dogodki").insert({ prijava_id: prijavaId, message });
}

export type MutationResult = { id: string } | { error: string };

export async function createRegistration(
  terminSlug: string,
  input: { fullName: string; email: string; phone: string },
): Promise<MutationResult> {
  const termin = await getTerminRowBySlug(terminSlug);
  if (!termin) return { error: "Termin ne obstaja." };

  const client = getSupabaseServerClient();
  const { data: voznik, error: voznikError } = await client
    .from("vozniki")
    .insert({ full_name: input.fullName, email: input.email, phone: input.phone })
    .select("id")
    .single();
  if (voznikError) return { error: voznikError.message };

  const { data: prijava, error: prijavaError } = await client
    .from("prijave")
    .insert({ termin_id: termin.id, voznik_id: voznik.id })
    .select("id, registration_code")
    .single();
  if (prijavaError) {
    if (prijavaError.code === "23505") {
      return { error: "Ta voznik je za ta termin že prijavljen." };
    }
    return { error: prijavaError.message };
  }

  await syncNarocnikFromRegistration({
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    voznikId: voznik.id,
    source: "Ročno dodano",
  });

  await logRegistrationEvent(prijava.id, "Izpolnjena prijava");

  if (input.email) {
    const { subject, html } = await buildQuickRegistrationEmail({
      locale: ADMIN_LOCALE,
      driverName: input.fullName,
      registrationCode: prijava.registration_code,
      terminTitle: buildTerminTitle(programKeyToShort(termin.program), termin.modul),
      terminDate: formatSlovenianDate(termin.date),
      timeRange: formatTimeRange(termin.start_time, termin.end_time),
      address: termin.address ?? undefined,
      price: formatPriceEur(termin.price_eur),
      completeFormUrl: `${getSiteUrl()}${publicTerminHref(termin.program, termin.date)}/obrazec?prijava=${prijava.registration_code}`,
    });
    await sendEmail({ to: input.email, subject, html, attachments: [getLogoAttachment()] });
  }

  return { id: prijava.id };
}

export async function updateRegistration(
  terminSlug: string,
  registrationId: string,
  driver: TerminDriver,
): Promise<MutationResult> {
  const termin = await getTerminRowBySlug(terminSlug);
  if (!termin) return { error: "Termin ne obstaja." };

  const client = getSupabaseServerClient();
  const { data: prijava, error: findError } = await client
    .from("prijave")
    .select("voznik_id, payment_status")
    .eq("id", registrationId)
    .eq("termin_id", termin.id)
    .maybeSingle();
  if (findError) return { error: findError.message };
  if (!prijava) return { error: "Prijava ne obstaja." };

  const { error: voznikError } = await client
    .from("vozniki")
    .update({
      full_name: driver.driverName,
      email: driver.email || null,
      phone: driver.phone || null,
      date_of_birth: driver.dateOfBirth ? dmyToIso(driver.dateOfBirth) : null,
      place_of_birth: driver.birthPlace || null,
      country_of_birth: driver.birthCountry || null,
      citizenship: driver.citizenship || null,
      emso: driver.emso || null,
      residence_type: driver.residenceType ?? null,
      street_address: driver.streetAddress || null,
      postal_code: driver.postalCode || null,
      city: driver.city || null,
    })
    .eq("id", prijava.voznik_id);
  if (voznikError) return { error: voznikError.message };

  const licenceCategories = [
    ...(driver.categoryC ? (["C"] as const) : []),
    ...(driver.categoryD ? (["D"] as const) : []),
  ];

  const { error: prijavaError } = await client
    .from("prijave")
    .update({
      licence_categories: licenceCategories.length > 0 ? licenceCategories : null,
      payment_status: driver.paymentStatus === "poravnano" ? "paid" : "pending",
    })
    .eq("id", registrationId);
  if (prijavaError) return { error: prijavaError.message };

  if (prijava.payment_status !== "paid" && driver.paymentStatus === "poravnano") {
    await logRegistrationEvent(registrationId, "Zabeleženo plačilo");
  }

  return { id: registrationId };
}

export async function markRegistrationPaid(
  terminSlug: string,
  registrationId: string,
): Promise<MutationResult> {
  const termin = await getTerminRowBySlug(terminSlug);
  if (!termin) return { error: "Termin ne obstaja." };

  const client = getSupabaseServerClient();
  const { data: prijava, error: findError } = await client
    .from("prijave")
    .select("payment_status")
    .eq("id", registrationId)
    .eq("termin_id", termin.id)
    .maybeSingle();
  if (findError) return { error: findError.message };
  if (!prijava) return { error: "Prijava ne obstaja." };
  if (prijava.payment_status === "paid") return { id: registrationId };

  const { error } = await client
    .from("prijave")
    .update({ payment_status: "paid" })
    .eq("id", registrationId);
  if (error) return { error: error.message };

  await logRegistrationEvent(registrationId, "Zabeleženo plačilo");

  return { id: registrationId };
}

export async function sendFormReminder(
  terminSlug: string,
  registrationId: string,
): Promise<{ error?: string }> {
  const termin = await getTerminRowBySlug(terminSlug);
  if (!termin) return { error: "Termin ne obstaja." };

  const client = getSupabaseServerClient();
  const { data, error: findError } = await client
    .from("prijave")
    .select("registration_code, vozniki(full_name, email)")
    .eq("id", registrationId)
    .eq("termin_id", termin.id)
    .maybeSingle();
  if (findError) return { error: findError.message };
  if (!data) return { error: "Prijava ne obstaja." };

  const prijava = data as unknown as {
    registration_code: string;
    vozniki: { full_name: string; email: string | null };
  };
  if (!prijava.vozniki?.email) return { error: "Voznik nima e-poštnega naslova." };

  const { subject, html } = await buildFormReminderEmail({
    locale: ADMIN_LOCALE,
    driverName: prijava.vozniki.full_name,
    terminTitle: buildTerminTitle(programKeyToShort(termin.program), termin.modul),
    terminDate: formatSlovenianDate(termin.date),
    completeFormUrl: `${getSiteUrl()}${publicTerminHref(termin.program, termin.date)}/obrazec?prijava=${prijava.registration_code}`,
  });
  await sendEmail({
    to: prijava.vozniki.email,
    subject,
    html,
    attachments: [getLogoAttachment()],
  });

  await logRegistrationEvent(registrationId, "Ročno poslano obvestilo za izpolnitev obrazca");

  return {};
}

export async function moveRegistration(
  currentTerminSlug: string,
  registrationId: string,
  targetTerminSlug: string,
): Promise<MutationResult> {
  const currentTermin = await getTerminRowBySlug(currentTerminSlug);
  if (!currentTermin) return { error: "Termin ne obstaja." };
  if (targetTerminSlug === currentTerminSlug) {
    return { error: "Voznik je že prijavljen na ta termin." };
  }

  const targetTermin = await getTerminRowBySlug(targetTerminSlug);
  if (!targetTermin) return { error: "Ciljni termin ne obstaja." };

  const client = getSupabaseServerClient();

  if (targetTermin.capacity !== null) {
    const { count, error: countError } = await client
      .from("prijave")
      .select("id", { count: "exact", head: true })
      .eq("termin_id", targetTermin.id);
    if (countError) return { error: countError.message };
    if ((count ?? 0) >= targetTermin.capacity) {
      return { error: "Ciljni termin je poln." };
    }
  }

  const { error } = await client
    .from("prijave")
    .update({ termin_id: targetTermin.id })
    .eq("id", registrationId)
    .eq("termin_id", currentTermin.id);
  if (error) {
    if (error.code === "23505") {
      return { error: "Voznik je za ciljni termin že prijavljen." };
    }
    return { error: error.message };
  }

  const targetTitle = buildTerminTitle(
    programKeyToShort(targetTermin.program),
    targetTermin.modul,
  ).replace(/\s*\([^)]*\)\s*$/, "");
  await logRegistrationEvent(
    registrationId,
    `Prestavljen na termin: ${targetTitle} (${formatSlovenianDate(targetTermin.date)})`,
  );

  return { id: registrationId };
}

export async function deleteRegistration(
  terminSlug: string,
  registrationId: string,
): Promise<{ error?: string }> {
  const termin = await getTerminRowBySlug(terminSlug);
  if (!termin) return { error: "Termin ne obstaja." };

  const client = getSupabaseServerClient();
  const { error } = await client
    .from("prijave")
    .delete()
    .eq("id", registrationId)
    .eq("termin_id", termin.id);
  if (error) return { error: error.message };
  return {};
}

export type DriverSearchResult = { driver: TerminDriver; terminId: string; terminTitle: string };

type FullyJoinedPrijava = PrijaveRow & { vozniki: VozniciRow; termini: TerminiRow };

// Multiple termini can share the exact same title (e.g. every "Redno
// usposabljanje Koda 95" module), so results show the date alongside it to
// tell them apart.
function formatTerminLabel(termin: TerminiRow): string {
  const title = buildTerminTitle(programKeyToShort(termin.program), termin.modul);
  return `${title.replace(/\s*\([^)]*\)\s*$/, "")} (${termin.date})`;
}

async function getAllJoinedRegistrations(): Promise<DriverSearchResult[]> {
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from("prijave")
    .select("*, vozniki(*), termini(*)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (data as unknown as FullyJoinedPrijava[]).map((row) => ({
    driver: toTerminDriver(row, row.termini.price_eur),
    terminId: terminSlug(row.termini.program, row.termini.date),
    terminTitle: formatTerminLabel(row.termini),
  }));
}

// Searches every registration by name, email or phone — used by the global
// nav search.
export async function searchDrivers(query: string): Promise<DriverSearchResult[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const all = await getAllJoinedRegistrations();
  return all
    .filter(({ driver }) => {
      const haystack =
        `${driver.driverName} ${driver.email ?? ""} ${driver.phone ?? ""}`.toLowerCase();
      return haystack.includes(trimmed);
    })
    .slice(0, 8);
}

// Every registration across every termin — used by the statistika page for
// the monthly count and the PDF export.
export async function getAllRegistrations(): Promise<DriverSearchResult[]> {
  return getAllJoinedRegistrations();
}

// Feeds the unread-style badge on the nav's Obveščanje bell — counts
// registrations created after the admin's last visit to that page (or every
// registration ever, if they've never visited it).
export async function countNewRegistrationsSince(sinceIso: string | null): Promise<number> {
  const client = getSupabaseServerClient();
  let query = client.from("prijave").select("id", { count: "exact", head: true });
  if (sinceIso) query = query.gt("created_at", sinceIso);
  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
}
