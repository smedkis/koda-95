import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicTermin, programKeyToShort, publicTerminHref } from "./termini";
import { syncNarocnikFromRegistration } from "./narocniki";
import { logRegistrationEvent } from "./registrations";
import {
  buildTerminTitle,
  formatPriceEur,
  formatSlovenianDate,
  formatTimeRange,
} from "@/lib/termini-format";
import { sendEmail } from "@/lib/email/resend";
import {
  buildCompletionEmail,
  buildQuickRegistrationEmail,
  getLogoAttachment,
} from "@/lib/email/templates";
import { generateUpnQrDataUrl } from "@/lib/upn-qr";
import { RECIPIENT_IBAN, RECIPIENT_NAME } from "@/lib/payment-info";
import { getSiteUrl } from "@/lib/site-url";
import type {
  LicenceCategory,
  PayerType,
  PrijaveRow,
  ProgramKey,
  TerminiRow,
  VozniciRow,
} from "@/lib/supabase/database.types";

export type QuickRegistrationInput = {
  program: ProgramKey;
  dateISO: string;
  fullName: string;
  email: string;
  phone: string;
  consentMarketing: boolean;
  consentTerms: boolean;
  locale: string;
};

export type QuickRegistrationResult = { code: string } | { error: string };

// The termin-page quick form is the real registration moment: it creates
// the prijava (with a real TC-#### code) and counts against capacity right
// away. Category/personal/payment info isn't known yet, so those columns
// stay null until completeRegistration below fills them in — the driver is
// "officially registered" either way, per how the client described the
// flow: filling out the rest of the form is an additional step, not a
// prerequisite for being registered.
export async function submitQuickRegistration(
  input: QuickRegistrationInput,
): Promise<QuickRegistrationResult> {
  const termin = await getPublicTermin(input.program, input.dateISO);
  if (!termin) return { error: "Termin ne obstaja." };

  const client = getSupabaseServerClient();

  if (termin.capacity !== null) {
    const { count, error: countError } = await client
      .from("prijave")
      .select("*", { count: "exact", head: true })
      .eq("termin_id", termin.id);
    if (countError) return { error: countError.message };
    if ((count ?? 0) >= termin.capacity) {
      return { error: "Termin je žal poln." };
    }
  }

  const { data: voznik, error: voznikError } = await client
    .from("vozniki")
    .insert({ full_name: input.fullName, email: input.email || null, phone: input.phone || null })
    .select("id")
    .single();
  if (voznikError) return { error: voznikError.message };

  const { data: prijava, error: prijavaError } = await client
    .from("prijave")
    .insert({
      termin_id: termin.id,
      voznik_id: voznik.id,
      consent_marketing: input.consentMarketing,
      consent_terms: input.consentTerms,
    })
    .select("id, registration_code")
    .single();

  if (prijavaError) {
    if (prijavaError.code === "23505") {
      return { error: "Za ta termin ste že prijavljeni." };
    }
    return { error: prijavaError.message };
  }

  await syncNarocnikFromRegistration({
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    voznikId: voznik.id,
    source: "Obrazec",
  });

  await logRegistrationEvent(prijava.id, "Izpolnjena prijava");

  if (input.email) {
    const { subject, html } = await buildQuickRegistrationEmail({
      locale: input.locale,
      driverName: input.fullName,
      registrationCode: prijava.registration_code,
      terminTitle: buildTerminTitle(programKeyToShort(termin.program), termin.modul, input.locale),
      terminDate: formatSlovenianDate(termin.date),
      timeRange: formatTimeRange(termin.start_time, termin.end_time),
      address: termin.address ?? undefined,
      price: formatPriceEur(termin.price_eur),
      completeFormUrl: `${getSiteUrl()}${publicTerminHref(termin.program, termin.date)}/obrazec?prijava=${prijava.registration_code}`,
    });
    await sendEmail({ to: input.email, subject, html, attachments: [getLogoAttachment()] });
  }

  return { code: prijava.registration_code };
}

export type CompleteRegistrationInput = {
  locale: string;
  licenceCategories: LicenceCategory[];
  placeOfBirth: string;
  countryOfBirth: string;
  citizenship: string;
  emso: string;
  dateOfBirth: string;
  residenceType: "permanent" | "temporary";
  address: string;
  postalCode: string;
  city: string;
  payerType: PayerType;
  companyName?: string;
  companyTaxNumber?: string;
  companyEmail?: string;
};

export type CompleteRegistrationResult = { ok: true } | { error: string };

// Fills in the rest of an already-registered prijava (found by its
// registration code) with the personal/category/payment details from the
// 3-step /obrazec form. A returning driver's quick-form submission always
// creates a fresh voznik row (their EMŠO isn't known yet at that point), so
// if the EMŠO entered here collides with an existing profile, that fresh
// row is a duplicate of a real returning driver — merge into the existing
// profile instead of failing: repoint this prijava to it, carry over the
// freshest contact details, and drop the duplicate.
export async function completeRegistration(
  code: string,
  input: CompleteRegistrationInput,
): Promise<CompleteRegistrationResult> {
  const client = getSupabaseServerClient();
  const { data: prijava, error: findError } = await client
    .from("prijave")
    .select("id, voznik_id, termin_id")
    .eq("registration_code", code)
    .maybeSingle();
  if (findError) return { error: findError.message };
  if (!prijava) return { error: "Prijava ne obstaja." };

  let finalVoznikId = prijava.voznik_id;

  const personalFields = {
    date_of_birth: input.dateOfBirth || null,
    place_of_birth: input.placeOfBirth || null,
    country_of_birth: input.countryOfBirth || null,
    citizenship: input.citizenship || null,
    emso: input.emso.trim() || null,
    residence_type: input.residenceType,
    postal_code: input.postalCode || null,
    city: input.city || null,
    street_address: input.address || null,
  };

  const { error: voznikError } = await client
    .from("vozniki")
    .update(personalFields)
    .eq("id", prijava.voznik_id);
  if (voznikError) {
    if (voznikError.code !== "23505") return { error: voznikError.message };

    const { data: existing, error: findExistingError } = await client
      .from("vozniki")
      .select("id")
      .eq("emso", personalFields.emso as string)
      .neq("id", prijava.voznik_id)
      .maybeSingle();
    if (findExistingError) return { error: findExistingError.message };
    if (!existing) return { error: "S tem EMŠO je že registriran drug voznik." };

    const { data: duplicate, error: duplicateError } = await client
      .from("vozniki")
      .select("full_name, email, phone")
      .eq("id", prijava.voznik_id)
      .single();
    if (duplicateError) return { error: duplicateError.message };

    const { error: mergeError } = await client
      .from("vozniki")
      .update({ ...personalFields, ...duplicate })
      .eq("id", existing.id);
    if (mergeError) return { error: mergeError.message };

    const { error: repointError } = await client
      .from("prijave")
      .update({ voznik_id: existing.id })
      .eq("id", prijava.id);
    if (repointError) return { error: repointError.message };

    await client
      .from("narocniki")
      .update({ voznik_id: existing.id })
      .eq("voznik_id", prijava.voznik_id);

    await client.from("vozniki").delete().eq("id", prijava.voznik_id);
    finalVoznikId = existing.id;
  }

  const { error: prijavaError } = await client
    .from("prijave")
    .update({
      licence_categories: input.licenceCategories,
      payer_type: input.payerType,
      company_name: input.payerType === "company" ? input.companyName || null : null,
      company_tax_number: input.payerType === "company" ? input.companyTaxNumber || null : null,
      company_email: input.payerType === "company" ? input.companyEmail || null : null,
    })
    .eq("id", prijava.id);
  if (prijavaError) return { error: prijavaError.message };

  await logRegistrationEvent(prijava.id, "Izpolnil obrazec");

  const [{ data: voznik }, { data: terminRow }] = await Promise.all([
    client.from("vozniki").select("full_name, email").eq("id", finalVoznikId).single(),
    client.from("termini").select("*").eq("id", prijava.termin_id).single(),
  ]);

  if (voznik?.email && terminRow) {
    const hasPrice = terminRow.price_eur !== null;
    const amount = hasPrice
      ? new Intl.NumberFormat("sl-SI", { style: "currency", currency: "EUR" }).format(
          terminRow.price_eur as number,
        )
      : null;
    const terminTitle = buildTerminTitle(
      programKeyToShort(terminRow.program),
      terminRow.modul,
      input.locale,
    );
    const reference = `SI00${code}`;

    let qrCid: string | undefined;
    let qrContent: string | undefined;
    if (hasPrice && input.payerType === "self") {
      const qrDataUrl = await generateUpnQrDataUrl({
        amount: terminRow.price_eur as number,
        iban: RECIPIENT_IBAN,
        reference,
        recipientName: RECIPIENT_NAME,
        purpose: terminTitle,
      });
      qrCid = "upn-qr";
      qrContent = qrDataUrl.split(",")[1];
    }

    const { subject, html } = await buildCompletionEmail({
      locale: input.locale,
      driverName: voznik.full_name,
      registrationCode: code,
      terminTitle,
      terminDate: formatSlovenianDate(terminRow.date),
      amount,
      payerType: input.payerType,
      companyName: input.companyName,
      iban: RECIPIENT_IBAN,
      recipientName: RECIPIENT_NAME,
      reference,
      qrCid,
    });
    await sendEmail({
      to: voznik.email,
      subject,
      html,
      attachments: [
        getLogoAttachment(),
        ...(qrContent ? [{ filename: "placilo-qr.png", content: qrContent, contentId: qrCid }] : []),
      ],
    });
  }

  return { ok: true };
}

export type RegistrationDetails = {
  registrationCode: string;
  driverName: string;
  terminTitle: string;
  dateISO: string;
  timeRange?: string;
  address?: string;
  priceEur: number | null;
  payerType: PayerType;
  companyName: string | null;
  companyEmail: string | null;
};

type JoinedPrijava = PrijaveRow & { vozniki: VozniciRow; termini: TerminiRow };

export async function getRegistrationByCode(
  code: string,
  locale = "sl",
): Promise<RegistrationDetails | null> {
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from("prijave")
    .select("*, vozniki(*), termini(*)")
    .eq("registration_code", code)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const row = data as unknown as JoinedPrijava;
  return {
    registrationCode: row.registration_code,
    driverName: row.vozniki.full_name,
    terminTitle: buildTerminTitle(programKeyToShort(row.termini.program), row.termini.modul, locale),
    dateISO: row.termini.date,
    timeRange: formatTimeRange(row.termini.start_time, row.termini.end_time),
    address: row.termini.address ?? undefined,
    priceEur: row.termini.price_eur,
    payerType: row.payer_type,
    companyName: row.company_name,
    companyEmail: row.company_email,
  };
}
