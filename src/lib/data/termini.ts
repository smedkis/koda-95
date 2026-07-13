import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ProgramKey, TerminiRow } from "@/lib/supabase/database.types";
import {
  buildTerminTitle,
  formatPriceEur,
  formatSlovenianDate,
  formatTimeRange,
  todayIso,
  toHoursMinutes,
} from "@/lib/termini-format";
import type { AdminTerminCardProps } from "@/components/admin/AdminTerminCard";

export type Program = "redna" | "zacetna";

const PROGRAM_TO_KEY: Record<Program, ProgramKey> = {
  redna: "redna-koda-95",
  zacetna: "zacetna-koda-95",
};
const KEY_TO_PROGRAM: Record<ProgramKey, Program> = {
  "redna-koda-95": "redna",
  "zacetna-koda-95": "zacetna",
};

export function terminSlug(program: ProgramKey, date: string): string {
  return `${KEY_TO_PROGRAM[program]}-${date}`;
}

const SLUG_PATTERN = /^(redna|zacetna)-(\d{4}-\d{2}-\d{2})$/;

export function parseTerminSlug(slug: string): { program: ProgramKey; date: string } | null {
  const match = slug.match(SLUG_PATTERN);
  if (!match) return null;
  const [, program, date] = match;
  return { program: PROGRAM_TO_KEY[program as Program], date };
}

export type TerminCardData = AdminTerminCardProps & { program: Program };

export type TerminFormData = TerminCardData & {
  dateISO: string;
  startTime: string;
  endTime: string;
  modul?: string;
};

type RegistrationCounts = { registered: number; formsCompleted: number; paid: number };

function toCardData(
  row: TerminiRow,
  counts: RegistrationCounts,
): TerminCardData {
  const program = KEY_TO_PROGRAM[row.program];
  const hasCapacity = row.capacity !== null;
  return {
    id: terminSlug(row.program, row.date),
    program,
    title: buildTerminTitle(program, row.modul),
    date: formatSlovenianDate(row.date),
    address: row.address,
    timeRange: formatTimeRange(row.start_time, row.end_time),
    price: formatPriceEur(row.price_eur),
    attendeeCount: hasCapacity ? counts.registered : undefined,
    capacity: row.capacity ?? undefined,
    registeredCount: counts.registered,
    formsCompletedCount: counts.formsCompleted,
    paidCount: counts.paid,
    isPast: row.date < todayIso(),
  };
}

function toFormData(row: TerminiRow): TerminFormData {
  const card = toCardData(row, { registered: 0, formsCompleted: 0, paid: 0 });
  return {
    ...card,
    dateISO: row.date,
    startTime: toHoursMinutes(row.start_time),
    endTime: toHoursMinutes(row.end_time),
    modul: row.modul !== null ? String(row.modul) : undefined,
  };
}

async function countsByTermin(terminIds: string[]): Promise<Map<string, RegistrationCounts>> {
  const counts = new Map<string, RegistrationCounts>();
  if (terminIds.length === 0) return counts;

  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from("prijave")
    .select("termin_id, licence_categories, consent_terms, payment_status")
    .in("termin_id", terminIds);
  if (error) throw new Error(error.message);

  for (const row of data ?? []) {
    const current = counts.get(row.termin_id) ?? { registered: 0, formsCompleted: 0, paid: 0 };
    current.registered += 1;
    if (row.licence_categories && row.licence_categories.length > 0 && row.consent_terms !== null) {
      current.formsCompleted += 1;
    }
    if (row.payment_status === "paid") current.paid += 1;
    counts.set(row.termin_id, current);
  }
  return counts;
}

export async function listTermini(): Promise<{
  upcoming: TerminCardData[];
  past: TerminCardData[];
}> {
  const client = getSupabaseServerClient();
  const { data, error } = await client.from("termini").select("*").order("date", { ascending: true });
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const counts = await countsByTermin(rows.map((row) => row.id));
  const today = todayIso();

  const upcoming = rows
    .filter((row) => row.date >= today)
    .map((row) => toCardData(row, counts.get(row.id) ?? { registered: 0, formsCompleted: 0, paid: 0 }));
  const past = rows
    .filter((row) => row.date < today)
    .map((row) => toCardData(row, counts.get(row.id) ?? { registered: 0, formsCompleted: 0, paid: 0 }))
    .reverse();

  return { upcoming, past };
}

export async function getTerminBySlug(slug: string): Promise<TerminFormData | null> {
  const parsed = parseTerminSlug(slug);
  if (!parsed) return null;

  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from("termini")
    .select("*")
    .eq("program", parsed.program)
    .eq("date", parsed.date)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  return toFormData(data);
}

export async function getTerminRowBySlug(slug: string): Promise<TerminiRow | null> {
  const parsed = parseTerminSlug(slug);
  if (!parsed) return null;

  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from("termini")
    .select("*")
    .eq("program", parsed.program)
    .eq("date", parsed.date)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export type TerminInput = {
  program: Program;
  dateISO: string;
  startTime: string;
  endTime: string;
  address: string;
  capacity?: number;
  price?: number;
  modul?: number;
};

export type TerminMutationResult = { slug: string } | { error: string };

export async function createTermin(input: TerminInput): Promise<TerminMutationResult> {
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from("termini")
    .insert({
      program: PROGRAM_TO_KEY[input.program],
      date: input.dateISO,
      address: input.address,
      start_time: input.startTime,
      end_time: input.endTime,
      capacity: input.capacity ?? null,
      price_eur: input.price ?? null,
      modul: input.modul ?? null,
    })
    .select("program, date")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Termin za ta program in datum že obstaja." };
    }
    return { error: error.message };
  }
  return { slug: terminSlug(data.program, data.date) };
}

export async function updateTermin(
  slug: string,
  input: TerminInput,
): Promise<TerminMutationResult> {
  const parsed = parseTerminSlug(slug);
  if (!parsed) return { error: "Termin ne obstaja." };

  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from("termini")
    .update({
      program: PROGRAM_TO_KEY[input.program],
      date: input.dateISO,
      address: input.address,
      start_time: input.startTime,
      end_time: input.endTime,
      capacity: input.capacity ?? null,
      price_eur: input.price ?? null,
      modul: input.modul ?? null,
    })
    .eq("program", parsed.program)
    .eq("date", parsed.date)
    .select("program, date")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Termin za ta program in datum že obstaja." };
    }
    return { error: error.message };
  }
  return { slug: terminSlug(data.program, data.date) };
}
