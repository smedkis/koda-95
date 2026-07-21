import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { programKeyToShort } from "./termini";
import { sendEmail } from "@/lib/email/resend";
import { buildTerminReminderEmail, getLogoAttachment } from "@/lib/email/templates";
import { buildTerminTitle, formatSlovenianDate, formatTimeRange } from "@/lib/termini-format";
import type { PrijaveRow, TerminiRow, VozniciRow } from "@/lib/supabase/database.types";

type JoinedPrijava = PrijaveRow & { vozniki: VozniciRow; termini: TerminiRow };

function tomorrowIso(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

// Run once a day (see the termin-reminders cron route) — emails everyone
// registered for a session happening tomorrow, regardless of form/payment
// status (this is just "don't forget", not tied to registration completeness).
// reminder_sent_at guards against a retried/duplicate cron run double-sending.
// dateOverride exists only so the cron route's manual test trigger can point
// this at a specific termin's date instead of always "tomorrow".
export async function sendTerminReminders(
  dateOverride?: string,
): Promise<{ sent: number; failed: number }> {
  const client = getSupabaseServerClient();
  const targetDate = dateOverride ?? tomorrowIso();

  const { data: termini, error: terminiError } = await client
    .from("termini")
    .select("id")
    .eq("date", targetDate);
  if (terminiError) throw new Error(terminiError.message);
  if (!termini || termini.length === 0) return { sent: 0, failed: 0 };

  const { data, error } = await client
    .from("prijave")
    .select("*, vozniki(*), termini(*)")
    .in(
      "termin_id",
      termini.map((termin) => termin.id),
    )
    .is("reminder_sent_at", null);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as JoinedPrijava[];
  const attachments = [getLogoAttachment()];
  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    if (!row.vozniki.email) continue;

    const { subject, html } = await buildTerminReminderEmail({
      locale: row.locale,
      driverName: row.vozniki.full_name,
      terminTitle: buildTerminTitle(
        programKeyToShort(row.termini.program),
        row.termini.modul,
        row.locale,
      ),
      terminDate: formatSlovenianDate(row.termini.date, row.locale),
      timeRange: formatTimeRange(row.termini.start_time, row.termini.end_time),
      address: row.termini.address ?? undefined,
    });

    const ok = await sendEmail({ to: row.vozniki.email, subject, html, attachments });
    if (!ok) {
      failed += 1;
      continue;
    }

    sent += 1;
    await client
      .from("prijave")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("id", row.id);
  }

  return { sent, failed };
}
