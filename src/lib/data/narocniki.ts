import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { NarocnikiRow, PrijaveRow, TerminiRow, VozniciRow } from "@/lib/supabase/database.types";
import type { ObvescanjeEntry, ObvescanjeEnrollment } from "@/components/admin/ObvescanjeTable";
import { todayIso } from "@/lib/termini-format";
import { getTerminBySlug, shortToProgramKey, publicTerminHref } from "./termini";
import { sendEmail } from "@/lib/email/resend";
import { buildBulkNotificationEmail, getLogoAttachment } from "@/lib/email/templates";
import { getSiteUrl } from "@/lib/site-url";

type JoinedPrijava = PrijaveRow & { termini: TerminiRow };
type JoinedNarocnik = NarocnikiRow & {
  vozniki: (VozniciRow & { prijave: JoinedPrijava[]; zunanja_usposabljanja: { date: string }[] }) | null;
};

// Past attendance can come from a real prijava on this platform or from an
// imported completion at another provider (zunanja_usposabljanja) — both
// count as "was_enrolled" for the badge, since the point is just "has this
// driver already done training," not where.
function computeEnrollment(
  prijave: JoinedPrijava[] | undefined,
  zunanjaDates: string[] | undefined,
): ObvescanjeEnrollment {
  const today = todayIso();

  const upcoming = (prijave ?? [])
    .filter((p) => p.termini.date >= today)
    .sort((a, b) => a.termini.date.localeCompare(b.termini.date));
  if (upcoming.length > 0) return { status: "enrolled", date: upcoming[0].termini.date };

  const pastDates = [
    ...(prijave ?? []).filter((p) => p.termini.date < today).map((p) => p.termini.date),
    ...(zunanjaDates ?? []),
  ].sort((a, b) => b.localeCompare(a));
  if (pastDates.length > 0) return { status: "was_enrolled", date: pastDates[0] };

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
    enrollment: computeEnrollment(
      row.vozniki?.prijave,
      row.vozniki?.zunanja_usposabljanja.map((z) => z.date),
    ),
  };
}

// PostgREST caps every response — including a ranged one — at the
// project's "max rows" API setting: requesting .range(0, 999) still comes
// back truncated to that cap (200 on this project), not the 1000 asked
// for. So the page size here must sit safely under that cap, or a batch
// that got silently truncated would look identical to a real last page
// and stop the loop early.
const NAROCNIKI_PAGE_SIZE = 100;

export async function getNarocniki(): Promise<ObvescanjeEntry[]> {
  const client = getSupabaseServerClient();
  const rows: JoinedNarocnik[] = [];

  for (let page = 0; ; page += 1) {
    const from = page * NAROCNIKI_PAGE_SIZE;
    const to = from + NAROCNIKI_PAGE_SIZE - 1;
    const { data, error } = await client
      .from("narocniki")
      .select("*, vozniki(*, prijave(*, termini(*)), zunanja_usposabljanja(date))")
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw new Error(error.message);

    rows.push(...(data as unknown as JoinedNarocnik[]));
    if (!data || data.length < NAROCNIKI_PAGE_SIZE) break;
  }

  return rows.map(toEntry);
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

export async function updateNarocnik(
  id: string,
  input: { name: string; email: string; phone: string; source: string },
): Promise<{ error?: string }> {
  const client = getSupabaseServerClient();
  const { error } = await client
    .from("narocniki")
    .update({
      full_name: input.name || null,
      email: input.email,
      phone: input.phone || null,
      source: input.source || null,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  return {};
}

export type NotificationAudience = { never: boolean; wasEnrolled: boolean; enrolled: boolean };

// Resend rate-limits at 2 requests/second on most plans — batching keeps us
// under that instead of firing every recipient at once, which would start
// silently failing sends partway through a large audience.
const BULK_SEND_BATCH_SIZE = 5;

// The bulk "Pošlji obvestilo" send — resolves termin slugs to their real,
// current title/public URL server-side (never trusts client-supplied
// content for what goes in the email), filters narocniki by enrollment
// status, and emails everyone matching. Only email is wired up for now —
// Viber is a future channel, per the admin UI's disabled checkbox.
export async function sendBulkNotification(input: {
  audience: NotificationAudience;
  terminSlugs: string[];
}): Promise<{ sent: number; failed: number } | { error: string }> {
  const terminiData = await Promise.all(input.terminSlugs.map((slug) => getTerminBySlug(slug)));
  const termini = terminiData
    .filter((termin) => termin !== null)
    .map((termin) => ({
      title: termin.title,
      href: `${getSiteUrl()}${publicTerminHref(shortToProgramKey(termin.program), termin.dateISO)}?vir=obvescanje`,
      date: termin.date,
    }));
  if (termini.length === 0) return { error: "Izbran termin ne obstaja več." };

  const entries = await getNarocniki();
  const recipients = entries.filter((entry) => {
    if (entry.enrollment.status === "never") return input.audience.never;
    if (entry.enrollment.status === "was_enrolled") return input.audience.wasEnrolled;
    return input.audience.enrolled;
  });
  if (recipients.length === 0) return { sent: 0, failed: 0 };

  const attachments = [getLogoAttachment()];
  const sentIds: string[] = [];
  let failed = 0;

  for (let i = 0; i < recipients.length; i += BULK_SEND_BATCH_SIZE) {
    const batch = recipients.slice(i, i + BULK_SEND_BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (recipient) => {
        const unsubscribeHref = `${getSiteUrl()}/odjava?id=${recipient.id}`;
        const { subject, html } = buildBulkNotificationEmail(termini, unsubscribeHref);
        const ok = await sendEmail({ to: recipient.email, subject, html, attachments });
        return { id: recipient.id, ok };
      }),
    );
    for (const result of results) {
      if (result.ok) sentIds.push(result.id);
      else failed += 1;
    }
  }

  if (sentIds.length > 0) {
    const client = getSupabaseServerClient();
    await client
      .from("narocniki")
      .update({ last_notified_at: new Date().toISOString() })
      .in("id", sentIds);
  }

  return { sent: sentIds.length, failed };
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
