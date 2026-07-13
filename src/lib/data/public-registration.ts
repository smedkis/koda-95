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

export type PublicRegistrationInput = {
  program: ProgramKey;
  dateISO: string;
  fullName: string;
  email: string;
  phone: string;
  consentMarketing: boolean;
  consentTerms: boolean;
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

export type PublicRegistrationResult = { code: string } | { error: string };

type SupabaseClient = ReturnType<typeof getSupabaseServerClient>;

// Returning drivers reuse their existing profile (matched by EMŠO) instead
// of creating a duplicate. The unique index on emso is partial (where emso
// is not null), which Postgres can't target via a plain ON CONFLICT clause
// from PostgREST, so this is a manual select-then-write upsert instead of
// .upsert().
async function upsertVoznikByEmso(
  client: SupabaseClient,
  input: PublicRegistrationInput,
): Promise<{ id: string } | { error: string }> {
  const emso = input.emso.trim() || null;
  const fields = {
    full_name: input.fullName,
    email: input.email || null,
    phone: input.phone || null,
    date_of_birth: input.dateOfBirth || null,
    place_of_birth: input.placeOfBirth || null,
    country_of_birth: input.countryOfBirth || null,
    citizenship: input.citizenship || null,
    emso,
    residence_type: input.residenceType,
    postal_code: input.postalCode || null,
    city: input.city || null,
    street_address: input.address || null,
  };

  if (emso) {
    const { data: existing, error: findError } = await client
      .from("vozniki")
      .select("id")
      .eq("emso", emso)
      .maybeSingle();
    if (findError) return { error: findError.message };

    if (existing) {
      const { error: updateError } = await client
        .from("vozniki")
        .update(fields)
        .eq("id", existing.id);
      if (updateError) return { error: updateError.message };
      return { id: existing.id };
    }
  }

  const { data: created, error: insertError } = await client
    .from("vozniki")
    .insert(fields)
    .select("id")
    .single();
  if (insertError) return { error: insertError.message };
  return { id: created.id };
}

export async function submitPublicRegistration(
  input: PublicRegistrationInput,
): Promise<PublicRegistrationResult> {
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

  const voznikResult = await upsertVoznikByEmso(client, input);
  if ("error" in voznikResult) return { error: voznikResult.error };

  const { data: prijava, error: prijavaError } = await client
    .from("prijave")
    .insert({
      termin_id: termin.id,
      voznik_id: voznikResult.id,
      licence_categories: input.licenceCategories,
      payer_type: input.payerType,
      company_name: input.payerType === "company" ? input.companyName || null : null,
      company_tax_number: input.payerType === "company" ? input.companyTaxNumber || null : null,
      company_email: input.payerType === "company" ? input.companyEmail || null : null,
      consent_marketing: input.consentMarketing,
      consent_terms: input.consentTerms,
    })
    .select("registration_code")
    .single();

  if (prijavaError) {
    if (prijavaError.code === "23505") {
      return { error: "S tem EMŠO ste za ta termin že prijavljeni." };
    }
    return { error: prijavaError.message };
  }

  await syncNarocnikFromRegistration({
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    voznikId: voznikResult.id,
    source: "Obrazec",
  });

  return { code: prijava.registration_code };
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
