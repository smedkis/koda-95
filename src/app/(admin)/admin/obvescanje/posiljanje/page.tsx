import type { Metadata } from "next";
import { PosljiObvestiloPageContent } from "@/components/admin/PosljiObvestiloPageContent";
import { PLACEHOLDER_TERMINI } from "@/lib/admin-termini-data";

export const metadata: Metadata = {
  title: "Pošlji obvestilo | Koda 95 Admin",
  robots: { index: false, follow: false },
};

export default function PosljiObvestiloPage() {
  return (
    <PosljiObvestiloPageContent
      termini={PLACEHOLDER_TERMINI.map((termin) => ({
        id: termin.id,
        program: termin.program,
        date: termin.date,
      }))}
    />
  );
}
