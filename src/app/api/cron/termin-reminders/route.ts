import { sendTerminReminders } from "@/lib/data/reminders";

// Vercel Cron calls this once a day (see vercel.json) with an
// `Authorization: Bearer $CRON_SECRET` header it adds automatically when
// CRON_SECRET is set as an env var — this check rejects anyone else who
// finds the URL.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // ?date=YYYY-MM-DD lets a manual test run target a specific termin
  // instead of always "tomorrow" — Vercel's own scheduled trigger never
  // sends this param.
  const dateOverride = new URL(request.url).searchParams.get("date") ?? undefined;
  const result = await sendTerminReminders(dateOverride);
  return Response.json(result);
}
