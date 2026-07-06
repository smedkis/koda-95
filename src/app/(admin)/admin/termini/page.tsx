import type { Metadata } from "next";
import { AdminTerminiPageContent } from "@/components/admin/AdminTerminiPageContent";
import { PLACEHOLDER_PAST_TERMINI, PLACEHOLDER_TERMINI } from "@/lib/admin-termini-data";

export const metadata: Metadata = {
  title: "Termini | Koda 95 Admin",
  robots: { index: false, follow: false },
};

export default function TerminiListPage() {
  return (
    <AdminTerminiPageContent termini={PLACEHOLDER_TERMINI} pastTermini={PLACEHOLDER_PAST_TERMINI} />
  );
}
