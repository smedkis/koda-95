import type { Metadata } from "next";
import { AdminTerminiCalendar, type CalendarTermin } from "@/components/admin/AdminTerminiCalendar";
import { listTermini, parseTerminSlug } from "@/lib/data/termini";
import type { TerminCardData } from "@/lib/data/termini";

export const metadata: Metadata = {
  title: "Termini | Koda 95 Admin",
  robots: { index: false, follow: false },
};

function toCalendarTermin(termin: TerminCardData): CalendarTermin {
  return {
    id: termin.id,
    program: termin.program,
    dateISO: parseTerminSlug(termin.id)?.date ?? "",
    registeredCount: termin.registeredCount,
    capacity: termin.capacity,
    modul: termin.program === "redna" ? termin.title.match(/\d{4}/)?.[0] : undefined,
  };
}

export default async function TerminiListPage() {
  const { upcoming, past } = await listTermini();
  const termini = [...upcoming, ...past].map(toCalendarTermin);
  return <AdminTerminiCalendar termini={termini} />;
}
