import type { Metadata } from "next";
import { PosljiObvestiloPageContent } from "@/components/admin/PosljiObvestiloPageContent";
import { listTermini } from "@/lib/data/termini";
import { getNarocniki } from "@/lib/data/narocniki";

export const metadata: Metadata = {
  title: "Pošlji obvestilo | Koda 95 Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PosljiObvestiloPage() {
  const { upcoming, past } = await listTermini();
  const narocniki = await getNarocniki();

  return (
    <PosljiObvestiloPageContent
      termini={[...upcoming, ...past].map((termin) => ({
        id: termin.id,
        program: termin.program,
        date: termin.date,
      }))}
      narocniki={narocniki.map((entry) => ({
        email: entry.email,
        status: entry.enrollment.status,
      }))}
    />
  );
}
