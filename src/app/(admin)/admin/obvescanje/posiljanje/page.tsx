import type { Metadata } from "next";
import { PosljiObvestiloPageContent } from "@/components/admin/PosljiObvestiloPageContent";
import { listTermini } from "@/lib/data/termini";

export const metadata: Metadata = {
  title: "Pošlji obvestilo | Koda 95 Admin",
  robots: { index: false, follow: false },
};

export default async function PosljiObvestiloPage() {
  const { upcoming, past } = await listTermini();

  return (
    <PosljiObvestiloPageContent
      termini={[...upcoming, ...past].map((termin) => ({
        id: termin.id,
        program: termin.program,
        date: termin.date,
      }))}
    />
  );
}
