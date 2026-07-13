import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getTerminRowBySlug } from "./termini";
import type { PrijaveRow, VozniciRow } from "@/lib/supabase/database.types";
import type { TerminDriver } from "@/components/admin/AdminTerminDriversTable";
import { dmyToIso, isoToDmy } from "@/lib/date-format";

type JoinedPrijava = PrijaveRow & { vozniki: VozniciRow };

function toTerminDriver(row: JoinedPrijava, priceEur: number | null): TerminDriver {
  const v = row.vozniki;
  const hasForm =
    !!row.licence_categories && row.licence_categories.length > 0 && row.consent_terms !== null;

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

  return toTerminDriver(data as unknown as JoinedPrijava, termin.price_eur);
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
    .select("id")
    .single();
  if (prijavaError) {
    if (prijavaError.code === "23505") {
      return { error: "Ta voznik je za ta termin že prijavljen." };
    }
    return { error: prijavaError.message };
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
    .select("voznik_id")
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
