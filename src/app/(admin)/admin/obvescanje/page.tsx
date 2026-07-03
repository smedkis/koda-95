import type { Metadata } from "next";
import Image from "next/image";
import { ObvescanjePageContent } from "@/components/admin/ObvescanjePageContent";
import type { ObvescanjeEntry } from "@/components/admin/ObvescanjeTable";
import { Button } from "@/components/ui/Button";
import { Heading2, Heading3 } from "@/components/ui/Typography";

export const metadata: Metadata = {
  title: "Obveščanje | Koda 95 Admin",
  robots: { index: false, follow: false },
};

// Placeholder data — will be replaced with a real Supabase query against
// the obvescanje view.
const PLACEHOLDER_ENTRIES: ObvescanjeEntry[] = [
  {
    id: "1",
    driverName: "Janez Novak",
    email: "janez.novak@example.com",
    phone: "+386 41 123 456",
    dateAdded: "2026-03-12",
    source: "Obrazec",
    lastNotified: "2026-06-01",
    enrollment: { status: "enrolled", date: "2026-05-20" },
  },
  {
    id: "2",
    driverName: "Ana Kovač",
    email: "ana.kovac@example.com",
    phone: "+386 31 987 654",
    dateAdded: "2026-01-28",
    source: "Kobal d.o.o.",
    lastNotified: "2026-05-15",
    enrollment: { status: "was_enrolled", date: "2026-02-18" },
  },
  {
    id: "3",
    driverName: "Marko Zupan",
    email: "marko.zupan@example.com",
    phone: "+386 40 555 222",
    dateAdded: "2026-05-02",
    source: "Obrazec",
    lastNotified: null,
    enrollment: { status: "never" },
  },
  {
    id: "4",
    driverName: "Petra Horvat",
    email: "petra.horvat@example.com",
    phone: "+386 51 333 111",
    dateAdded: "2025-11-09",
    source: "Termin (05.12.2025)",
    lastNotified: "2026-04-20",
    enrollment: { status: "was_enrolled", date: "2025-12-05" },
  },
  {
    id: "5",
    driverName: "Luka Bregar",
    email: "luka.bregar@example.com",
    phone: "+386 41 777 888",
    dateAdded: "2026-06-10",
    source: "Arriva",
    lastNotified: "2026-06-10",
    enrollment: { status: "enrolled", date: "2026-06-08" },
  },
  {
    id: "6",
    driverName: "Nina Potočnik",
    email: "nina.potocnik@example.com",
    phone: "+386 30 222 999",
    dateAdded: "2026-02-14",
    source: "Ročno dodano",
    lastNotified: "2026-03-01",
    enrollment: { status: "never" },
  },
  {
    id: "7",
    driverName: "Rok Kranjc",
    email: "rok.kranjc@example.com",
    phone: "+386 41 456 789",
    dateAdded: "2026-04-03",
    source: "Obrazec",
    lastNotified: "2026-05-28",
    enrollment: { status: "enrolled", date: "2026-06-17" },
  },
  {
    id: "8",
    driverName: "Maja Vidmar",
    email: "maja.vidmar@example.com",
    phone: "+386 51 222 333",
    dateAdded: "2026-01-15",
    source: "Forbiz",
    lastNotified: null,
    enrollment: { status: "never" },
  },
  {
    id: "9",
    driverName: "Tomaž Kos",
    email: "tomaz.kos@example.com",
    phone: "+386 31 444 555",
    dateAdded: "2025-09-22",
    source: "Ročno dodano",
    lastNotified: "2026-01-10",
    enrollment: { status: "was_enrolled", date: "2025-10-08" },
  },
  {
    id: "10",
    driverName: "Sara Bevc",
    email: "sara.bevc@example.com",
    phone: "+386 40 111 222",
    dateAdded: "2026-06-25",
    source: "Obrazec",
    lastNotified: "2026-06-25",
    enrollment: { status: "enrolled", date: "2026-07-15" },
  },
  {
    id: "11",
    driverName: "Miha Golob",
    email: "miha.golob@example.com",
    phone: "+386 41 888 999",
    dateAdded: "2026-03-30",
    source: "Jurenič Transport",
    lastNotified: "2026-04-02",
    enrollment: { status: "never" },
  },
  {
    id: "12",
    driverName: "Vesna Kalan",
    email: "vesna.kalan@example.com",
    phone: "+386 30 777 111",
    dateAdded: "2025-12-19",
    source: "Termin (17.06.2026)",
    lastNotified: "2026-05-01",
    enrollment: { status: "was_enrolled", date: "2026-01-14" },
  },
];

export default function ObvescanjeListPage() {
  return (
    <div className="mt-32 mb-32">
      <div className="flex items-center justify-between">
        <Heading2>Obveščanje</Heading2>
        <Button
          type="button"
          variant="primary"
          icon={<Image src="/bell-white.svg" alt="" width={16} height={16} />}
        >
          Pošlji obvestilo
        </Button>
      </div>
      <div className="mt-16 flex items-center justify-between">
        <Heading3>Naročniki</Heading3>
        <Button
          type="button"
          variant="action"
          icon={<Image src="/plus.svg" alt="" width={13} height={13} />}
        >
          Dodaj
        </Button>
      </div>
      <ObvescanjePageContent initialEntries={PLACEHOLDER_ENTRIES} />
    </div>
  );
}
