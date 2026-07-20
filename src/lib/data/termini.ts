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

export function programKeyToShort(program: ProgramKey): Program {
  return KEY_TO_PROGRAM[program];
}

const SLUG_PATTERN = /^(redna|zacetna)-(\d{4}-\d{2}-\d{2})$/;

export function parseTerminSlug(slug: string): { program: ProgramKey; date: string } | null {
  const match = slug.match(SLUG_PATTERN);
  if (!match) return null;
  const [, program, date] = match;
  return { program: PROGRAM_TO_KEY[program as Program], date };
}

export type TerminCardData = AdminTerminCardProps & { program: Program; newCount?: number };

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
  newCount?: number,
): TerminCardData {
  const program = KEY_TO_PROGRAM[row.program];
  const hasCapacity = row.capacity !== null;
  return {
    id: terminSlug(row.program, row.date),
    program,
    title: buildTerminTitle(program, row.modul),
    date: formatSlovenianDate(row.date),
    address: row.address ?? undefined,
    timeRange: formatTimeRange(row.start_time, row.end_time),
    price: formatPriceEur(row.price_eur),
    attendeeCount: hasCapacity ? counts.registered : undefined,
    capacity: row.capacity ?? undefined,
    registeredCount: counts.registered,
    formsCompletedCount: counts.formsCompleted,
    paidCount: counts.paid,
    isPast: row.date < todayIso(),
    newCount,
  };
}

function toFormData(row: TerminiRow): TerminFormData {
  const card = toCardData(row, { registered: 0, formsCompleted: 0, paid: 0 });
  return {
    ...card,
    dateISO: row.date,
    startTime: row.start_time ? toHoursMinutes(row.start_time) : "",
    endTime: row.end_time ? toHoursMinutes(row.end_time) : "",
    modul: row.modul !== null ? String(row.modul) : undefined,
  };
}

export async function countsByTermin(
  terminIds: string[],
): Promise<Map<string, RegistrationCounts>> {
  const counts = new Map<string, RegistrationCounts>();
  if (terminIds.length === 0) return counts;

  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from("prijave")
    .select("termin_id, licence_categories, payment_status")
    .in("termin_id", terminIds);
  if (error) throw new Error(error.message);

  for (const row of data ?? []) {
    const current = counts.get(row.termin_id) ?? { registered: 0, formsCompleted: 0, paid: 0 };
    current.registered += 1;
    // licence_categories is only ever written by completeRegistration, so
    // its presence alone is a reliable "form finished" signal — see the
    // matching note in registrations.ts's toTerminDriver.
    if (row.licence_categories && row.licence_categories.length > 0) {
      current.formsCompleted += 1;
    }
    if (row.payment_status === "paid") current.paid += 1;
    counts.set(row.termin_id, current);
  }
  return counts;
}

// Feeds the unread-style badge on each termin's calendar chip — registered
// per termin, so it counts registrations created after the admin's last
// visit to *that specific* termin's detail page (or every registration ever,
// for a termin never visited). seenMap is keyed by termin slug since that's
// what the cookie stores and what the detail page's URL exposes.
async function newRegistrationCountsByTermin(
  rows: TerminiRow[],
  seenMap: Record<string, string>,
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (rows.length === 0) return counts;

  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from("prijave")
    .select("termin_id, created_at")
    .in(
      "termin_id",
      rows.map((row) => row.id),
    );
  if (error) throw new Error(error.message);

  const slugByTerminId = new Map(rows.map((row) => [row.id, terminSlug(row.program, row.date)]));
  for (const prijava of data ?? []) {
    const slug = slugByTerminId.get(prijava.termin_id);
    if (!slug) continue;
    const seenAt = seenMap[slug];
    if (seenAt && prijava.created_at <= seenAt) continue;
    counts.set(prijava.termin_id, (counts.get(prijava.termin_id) ?? 0) + 1);
  }
  return counts;
}

export async function listTermini(
  seenMap: Record<string, string> = {},
): Promise<{
  upcoming: TerminCardData[];
  past: TerminCardData[];
}> {
  const client = getSupabaseServerClient();
  const { data, error } = await client.from("termini").select("*").order("date", { ascending: true });
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const counts = await countsByTermin(rows.map((row) => row.id));
  const newCounts = await newRegistrationCountsByTermin(rows, seenMap);
  const today = todayIso();

  const upcoming = rows
    .filter((row) => row.date >= today)
    .map((row) =>
      toCardData(
        row,
        counts.get(row.id) ?? { registered: 0, formsCompleted: 0, paid: 0 },
        newCounts.get(row.id),
      ),
    );
  const past = rows
    .filter((row) => row.date < today)
    .map((row) =>
      toCardData(
        row,
        counts.get(row.id) ?? { registered: 0, formsCompleted: 0, paid: 0 },
        newCounts.get(row.id),
      ),
    )
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
  startTime?: string;
  endTime?: string;
  address?: string;
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
      address: input.address ?? null,
      start_time: input.startTime ?? null,
      end_time: input.endTime ?? null,
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

// --- Public site (redna/zacetna landing + termin pages) -------------------

// The public URL segment is deliberately decoupled from the ProgramKey
// stored in the DB — renaming a route shouldn't ever require a data
// migration, and the DB value ("redna-koda-95") is also the admin's
// internal slug prefix, which has no reason to change just because the
// public-facing URL wording does.
const PUBLIC_PROGRAM_PATH: Record<ProgramKey, string> = {
  "redna-koda-95": "redno-usposabljanje",
  "zacetna-koda-95": "zacetno-usposabljanje",
};

export function publicTerminHref(program: ProgramKey, date: string): string {
  return `/${PUBLIC_PROGRAM_PATH[program]}/usposabljanje-${date}`;
}

const PUBLIC_SLUG_PATTERN = /^usposabljanje-(\d{4}-\d{2}-\d{2})$/;

export function parsePublicTerminSlug(slug: string): string | null {
  const match = slug.match(PUBLIC_SLUG_PATTERN);
  return match ? match[1] : null;
}

export type PublicTerminEntry = {
  title: string;
  date: string;
  dateISO: string;
  address?: string;
  timeRange?: string;
  price?: string;
  attendeeCount?: number;
  capacity?: number;
  href: string;
};

function toPublicEntry(row: TerminiRow, registeredCount: number): PublicTerminEntry {
  const hasCapacity = row.capacity !== null;
  return {
    title: buildTerminTitle(KEY_TO_PROGRAM[row.program], row.modul),
    date: formatSlovenianDate(row.date),
    dateISO: row.date,
    address: row.address ?? undefined,
    timeRange: formatTimeRange(row.start_time, row.end_time),
    price: formatPriceEur(row.price_eur),
    attendeeCount: hasCapacity ? registeredCount : undefined,
    capacity: row.capacity ?? undefined,
    href: publicTerminHref(row.program, row.date),
  };
}

export async function listPublicTermini(program: ProgramKey): Promise<PublicTerminEntry[]> {
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from("termini")
    .select("*")
    .eq("program", program)
    .gte("date", todayIso())
    .order("date", { ascending: true });
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const counts = await countsByTermin(rows.map((row) => row.id));
  return rows.map((row) => toPublicEntry(row, counts.get(row.id)?.registered ?? 0));
}

export async function getPublicTermin(
  program: ProgramKey,
  dateISO: string,
): Promise<TerminiRow | null> {
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from("termini")
    .select("*")
    .eq("program", program)
    .eq("date", dateISO)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
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
      address: input.address ?? null,
      start_time: input.startTime ?? null,
      end_time: input.endTime ?? null,
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

export async function deleteTermin(slug: string): Promise<{ error?: string }> {
  const parsed = parseTerminSlug(slug);
  if (!parsed) return { error: "Termin ne obstaja." };

  const client = getSupabaseServerClient();
  const { error } = await client
    .from("termini")
    .delete()
    .eq("program", parsed.program)
    .eq("date", parsed.date);

  if (error) {
    // prijave.termin_id references termini `on delete restrict`, on
    // purpose — a termin with real registrations should never silently
    // take their data down with it.
    if (error.code === "23503") {
      return { error: "Termina ni mogoče izbrisati, ker ima prijavljene voznike." };
    }
    return { error: error.message };
  }
  return {};
}
