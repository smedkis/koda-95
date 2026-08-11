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
    notifiedTerminIds: row.notified_termin_ids ?? [],
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
      notifiedTerminIds: [],
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

// Resend rate-limits at 2 requests/second on most plans, so sends go out
// strictly one at a time with a pause in between — previously a batch of 5
// fired concurrently via Promise.all with no delay before the next batch,
// which blew past the limit within the first couple of batches and left
// most of a large audience silently in `failed` (e.g. 84/248 delivered).
const BULK_SEND_DELAY_MS = 600;

// At ~0.6s/recipient, one chunk stays comfortably under Vercel Hobby's hard
// 60s function timeout (a large audience is sent as several chunked calls
// from the client instead of one long-running call — see
// PosljiObvestiloPageContent's send loop).
const BULK_SEND_CHUNK_SIZE = 40;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// One chunk of the bulk "Pošlji obvestilo" send — resolves termin slugs to
// their real, current title/public URL server-side (never trusts
// client-supplied content for what goes in the email), filters narocniki by
// enrollment status, then emails the next handful who haven't already been
// told about every one of the currently selected termini. Only email is
// wired up for now — Viber is a future channel, per the admin UI's disabled
// checkbox.
//
// Deliberately NOT offset-based: this always takes the front of a freshly
// recomputed, freshly re-filtered pool. An earlier version took an `offset`
// from the caller and sliced into that — but each successful send removes
// that recipient from the pool immediately, so the pool shrinks by a
// chunk's worth between calls while the caller's offset kept advancing by
// the same amount. The two drifted apart and skipped an entire unprocessed
// chunk every round, so a run could end early having silently never
// attempted a block of recipients. Always reading from position 0 of the
// live pool is immune to that: whatever hasn't been sent is always at the
// front, no matter how the pool moved.
//
// Dedup is per-termin, not per-day: an earlier version skipped anyone
// already emailed "today," which works for the same run but falls apart
// the moment a run has to resume past midnight (e.g. after hitting
// Resend's daily quota) — "today" becomes a new date and everyone already
// reached looks eligible again. Tracking which specific termini a contact
// has already been told about is immune to that: they're only skipped once
// every currently selected termin is already in their notified set,
// regardless of what day that happened on. This also means a contact who's
// heard about some but not all of the selected termini still gets the
// (now-updated) email — the whole point is telling them about what's new.
export async function sendBulkNotification(input: {
  audience: NotificationAudience;
  terminSlugs: string[];
}): Promise<
  { sent: number; failed: number; processed: number; remaining: number } | { error: string }
> {
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
    const alreadyToldAboutAllSelected = input.terminSlugs.every((slug) =>
      entry.notifiedTerminIds.includes(slug),
    );
    if (alreadyToldAboutAllSelected) return false;
    if (entry.enrollment.status === "never") return input.audience.never;
    if (entry.enrollment.status === "was_enrolled") return input.audience.wasEnrolled;
    return input.audience.enrolled;
  });
  const chunk = recipients.slice(0, BULK_SEND_CHUNK_SIZE);
  if (chunk.length === 0) return { sent: 0, failed: 0, processed: 0, remaining: 0 };

  const attachments = [getLogoAttachment()];
  const sentRecipients: ObvescanjeEntry[] = [];
  let failed = 0;
  let attempted = 0;
  // A handful of failures in a row (e.g. a couple of bad addresses) is
  // normal; this many back-to-back means something systemic broke — Resend
  // daily quota, API key issue, network outage — and every remaining
  // attempt would just fail the same way. Stop instead of burning through
  // (and, since nothing succeeds, never getting excluded by the "already
  // notified today" filter) the exact same unprocessed people forever.
  const CONSECUTIVE_FAILURE_LIMIT = 5;
  let consecutiveFailures = 0;
  let systemicFailure = false;

  for (const recipient of chunk) {
    attempted += 1;
    const unsubscribeHref = `${getSiteUrl()}/odjava?id=${recipient.id}`;
    const { subject, html } = buildBulkNotificationEmail(termini, unsubscribeHref);
    const ok = await sendEmail({ to: recipient.email, subject, html, attachments });
    if (ok) {
      sentRecipients.push(recipient);
      consecutiveFailures = 0;
    } else {
      failed += 1;
      consecutiveFailures += 1;
      if (consecutiveFailures >= CONSECUTIVE_FAILURE_LIMIT) {
        systemicFailure = true;
        break;
      }
    }

    if (attempted < chunk.length) await sleep(BULK_SEND_DELAY_MS);
  }

  if (sentRecipients.length > 0) {
    const client = getSupabaseServerClient();
    const now = new Date().toISOString();
    // Each recipient can have a different existing notified set, so this
    // can't be one bulk .update().in(...) call — it has to merge per row.
    await Promise.all(
      sentRecipients.map((recipient) => {
        const notifiedTerminIds = Array.from(
          new Set([...recipient.notifiedTerminIds, ...input.terminSlugs]),
        );
        return client
          .from("narocniki")
          .update({ last_notified_at: now, notified_termin_ids: notifiedTerminIds })
          .eq("id", recipient.id);
      }),
    );
  }

  if (systemicFailure) {
    return {
      error: `Pošiljanje ustavljeno po ${CONSECUTIVE_FAILURE_LIMIT} zaporednih neuspelih poskusih — verjetno je dosežena dnevna omejitev pošiljanja pri Resend. ${sentRecipients.length} sporočil je bilo uspešno poslanih pred zaustavitvijo. Poskusite znova kasneje.`,
    };
  }

  return {
    sent: sentRecipients.length,
    failed,
    processed: attempted,
    remaining: recipients.length - attempted,
  };
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
