import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicTermin, programKeyToShort } from "./termini";
import { syncNarocnikFromRegistration } from "./narocniki";
import { buildTerminTitle, formatTimeRange } from "@/lib/termini-format";
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
    .select("registration_code")
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

  return { code: prijava.registration_code };
}

export type CompleteRegistrationInput = {
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
// 3-step /obrazec form. Doesn't attempt to merge into a pre-existing
// vozniki profile even if the entered EMŠO matches one — this registration
// already has its own voznik row from submitQuickRegistration, so a
// returning driver ends up with two profiles rather than a unified history.
// A real merge (repointing prijava.voznik_id, deleting the duplicate) is
// more than this fix needs.
export async function completeRegistration(
  code: string,
  input: CompleteRegistrationInput,
): Promise<CompleteRegistrationResult> {
  const client = getSupabaseServerClient();
  const { data: prijava, error: findError } = await client
    .from("prijave")
    .select("id, voznik_id")
    .eq("registration_code", code)
    .maybeSingle();
  if (findError) return { error: findError.message };
  if (!prijava) return { error: "Prijava ne obstaja." };

  const { error: voznikError } = await client
    .from("vozniki")
    .update({
      date_of_birth: input.dateOfBirth || null,
      place_of_birth: input.placeOfBirth || null,
      country_of_birth: input.countryOfBirth || null,
      citizenship: input.citizenship || null,
      emso: input.emso.trim() || null,
      residence_type: input.residenceType,
      postal_code: input.postalCode || null,
      city: input.city || null,
      street_address: input.address || null,
    })
    .eq("id", prijava.voznik_id);
  if (voznikError) {
    if (voznikError.code === "23505") {
      return { error: "S tem EMŠO je že registriran drug voznik." };
    }
    return { error: voznikError.message };
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

  return { ok: true };
}

export type RegistrationDetails = {
  registrationCode: string;
  driverName: string;
  terminTitle: string;
  dateISO: string;
  timeRange: string;
  address: string;
  priceEur: number | null;
  payerType: PayerType;
  companyName: string | null;
  companyEmail: string | null;
};

type JoinedPrijava = PrijaveRow & { vozniki: VozniciRow; termini: TerminiRow };

export async function getRegistrationByCode(code: string): Promise<RegistrationDetails | null> {
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
    terminTitle: buildTerminTitle(programKeyToShort(row.termini.program), row.termini.modul),
    dateISO: row.termini.date,
    timeRange: formatTimeRange(row.termini.start_time, row.termini.end_time),
    address: row.termini.address,
    priceEur: row.termini.price_eur,
    payerType: row.payer_type,
    companyName: row.company_name,
    companyEmail: row.company_email,
  };
}
