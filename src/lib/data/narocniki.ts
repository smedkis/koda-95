import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { NarocnikiRow, PrijaveRow, TerminiRow, VozniciRow } from "@/lib/supabase/database.types";
import type { ObvescanjeEntry, ObvescanjeEnrollment } from "@/components/admin/ObvescanjeTable";
import { todayIso } from "@/lib/termini-format";

type JoinedPrijava = PrijaveRow & { termini: TerminiRow };
type JoinedNarocnik = NarocnikiRow & {
  vozniki: (VozniciRow & { prijave: JoinedPrijava[] }) | null;
};

function computeEnrollment(prijave: JoinedPrijava[] | undefined): ObvescanjeEnrollment {
  if (!prijave || prijave.length === 0) return { status: "never" };
  const today = todayIso();

  const upcoming = prijave
    .filter((p) => p.termini.date >= today)
    .sort((a, b) => a.termini.date.localeCompare(b.termini.date));
  if (upcoming.length > 0) return { status: "enrolled", date: upcoming[0].termini.date };

  const past = prijave
    .filter((p) => p.termini.date < today)
    .sort((a, b) => b.termini.date.localeCompare(a.termini.date));
  if (past.length > 0) return { status: "was_enrolled", date: past[0].termini.date };

  return { status: "never" };
}

function toEntry(row: JoinedNarocnik): ObvescanjeEntry {
  return {
    id: row.id,
    driverName: row.full_name ?? row.vozniki?.full_name ?? "",
    email: row.email,
    phone: row.phone ?? row.vozniki?.phone ?? "",
    dateAdded: row.created_at.slice(0, 10),
    source: row.source ?? "Ročno dodano",
    lastNotified: row.last_notified_at ? row.last_notified_at.slice(0, 10) : null,
    enrollment: computeEnrollment(row.vozniki?.prijave),
  };
}

export async function getNarocniki(): Promise<ObvescanjeEntry[]> {
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from("narocniki")
    .select("*, vozniki(*, prijave(*, termini(*)))")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (data as unknown as JoinedNarocnik[]).map(toEntry);
}

export type AddNarocnikInput = { name: string; email: string; phone: string; source: string };

export async function addNarocniki(
  entries: AddNarocnikInput[],
): Promise<{ error: string } | { entries: ObvescanjeEntry[] }> {
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from("narocniki")
    .upsert(
      entries.map((entry) => ({
        full_name: entry.name || null,
        email: entry.email,
        phone: entry.phone || null,
        source: entry.source || null,
      })),
      { onConflict: "email" },
    )
    .select("*");
  if (error) return { error: error.message };

  return {
    entries: data.map((row) => ({
      id: row.id,
      driverName: row.full_name ?? "",
      email: row.email,
      phone: row.phone ?? "",
      dateAdded: row.created_at.slice(0, 10),
      source: row.source ?? "Ročno dodano",
      lastNotified: null,
      enrollment: { status: "never" as const },
    })),
  };
}

export async function deleteNarocnik(id: string): Promise<{ error?: string }> {
  const client = getSupabaseServerClient();
  const { error } = await client.from("narocniki").delete().eq("id", id);
  if (error) return { error: error.message };
  return {};
}

// Keeps the contacts list in sync whenever a registration is created —
// whether via the admin's manual add or the public /obrazec flow — so a
// driver who registers after being manually pasted in updates the same
// row (matched by email) instead of creating a duplicate.
export async function syncNarocnikFromRegistration(input: {
  fullName: string;
  email: string;
  phone: string;
  voznikId: string;
  source: string;
}): Promise<void> {
  if (!input.email) return;
  const client = getSupabaseServerClient();
  await client.from("narocniki").upsert(
    {
      full_name: input.fullName || null,
      email: input.email,
      phone: input.phone || null,
      voznik_id: input.voznikId,
      source: input.source,
    },
    { onConflict: "email" },
  );
}
