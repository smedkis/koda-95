import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminTerminiCalendar, type CalendarTermin } from "@/components/admin/AdminTerminiCalendar";
import { listTermini, parseTerminSlug } from "@/lib/data/termini";
import type { TerminCardData } from "@/lib/data/termini";
import { parseTerminSeenMap, TERMIN_SEEN_COOKIE } from "@/lib/termin-seen";

export const metadata: Metadata = {
  title: "Termini | Koda 95 Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function toCalendarTermin(termin: TerminCardData): CalendarTermin {
  return {
    id: termin.id,
    program: termin.program,
    title: termin.title,
    dateISO: parseTerminSlug(termin.id)?.date ?? "",
    registeredCount: termin.registeredCount,
    capacity: termin.capacity,
    newCount: termin.newCount ?? 0,
  };
}

export default async function TerminiListPage() {
  const cookieStore = await cookies();
  const seenMap = parseTerminSeenMap(cookieStore.get(TERMIN_SEEN_COOKIE)?.value);
  const { upcoming, past } = await listTermini(seenMap);
  const termini = [...upcoming, ...past].map(toCalendarTermin);
  return <AdminTerminiCalendar termini={termini} />;
}
