import type { Metadata } from "next";
import { AdminTerminiPageContent } from "@/components/admin/AdminTerminiPageContent";
import { listTermini } from "@/lib/data/termini";

export const metadata: Metadata = {
  title: "Termini | Koda 95 Admin",
  robots: { index: false, follow: false },
};

export default async function TerminiListPage() {
  const { upcoming, past } = await listTermini();
  return <AdminTerminiPageContent termini={upcoming} pastTermini={past} />;
}
