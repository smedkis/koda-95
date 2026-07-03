import type { Metadata } from "next";
import { AdminTerminiPageContent } from "@/components/admin/AdminTerminiPageContent";

export const metadata: Metadata = {
  title: "Termini | Koda 95 Admin",
  robots: { index: false, follow: false },
};

// Placeholder data — will be replaced with a real Supabase query.
const PLACEHOLDER_TERMINI = [
  {
    program: "redna" as const,
    title: "Redno usposabljanje Koda 95 (2026)",
    date: "Sreda, 20.05. 2026",
    address: "Pot za krajem 35, 4000 Kranj",
    timeRange: "15.00 - 21.00",
    attendeeCount: 16,
    capacity: 24,
    registeredCount: 16,
    formsCompletedCount: 9,
    paidCount: 5,
  },
  {
    program: "redna" as const,
    title: "Redno usposabljanje Koda 95 (2026)",
    date: "Sreda, 17.06. 2026",
    address: "Pot za krajem 35, 4000 Kranj",
    timeRange: "15.00 - 21.00",
    attendeeCount: 9,
    capacity: 24,
    registeredCount: 9,
    formsCompletedCount: 4,
    paidCount: 2,
  },
  {
    program: "redna" as const,
    title: "Redno usposabljanje Koda 95 (2026)",
    date: "Sreda, 15.07. 2026",
    address: "Pot za krajem 35, 4000 Kranj",
    timeRange: "15.00 - 21.00",
    attendeeCount: 22,
    capacity: 24,
    registeredCount: 22,
    formsCompletedCount: 18,
    paidCount: 12,
  },
  {
    program: "zacetna" as const,
    title: "Začetno usposabljanje Koda 95",
    date: "Ponedeljek, 08.06. 2026",
    address: "Pot za krajem 35, 4000 Kranj",
    timeRange: "08.00 - 16.00",
    attendeeCount: 12,
    capacity: 20,
    registeredCount: 12,
    formsCompletedCount: 7,
    paidCount: 3,
  },
  {
    program: "zacetna" as const,
    title: "Začetno usposabljanje Koda 95",
    date: "Ponedeljek, 13.07. 2026",
    address: "Pot za krajem 35, 4000 Kranj",
    timeRange: "08.00 - 16.00",
    attendeeCount: 5,
    capacity: 20,
    registeredCount: 5,
    formsCompletedCount: 2,
    paidCount: 1,
  },
];

const PLACEHOLDER_PAST_TERMINI = [
  {
    program: "redna" as const,
    title: "Redno usposabljanje Koda 95 (2026)",
    date: "Sreda, 21.01. 2026",
    address: "Pot za krajem 35, 4000 Kranj",
    timeRange: "15.00 - 21.00",
    attendeeCount: 24,
    capacity: 24,
    registeredCount: 24,
    formsCompletedCount: 24,
    paidCount: 24,
  },
  {
    program: "redna" as const,
    title: "Redno usposabljanje Koda 95 (2026)",
    date: "Sreda, 18.02. 2026",
    address: "Pot za krajem 35, 4000 Kranj",
    timeRange: "15.00 - 21.00",
    attendeeCount: 19,
    capacity: 24,
    registeredCount: 19,
    formsCompletedCount: 19,
    paidCount: 19,
  },
  {
    program: "zacetna" as const,
    title: "Začetno usposabljanje Koda 95",
    date: "Ponedeljek, 09.02. 2026",
    address: "Pot za krajem 35, 4000 Kranj",
    timeRange: "08.00 - 16.00",
    attendeeCount: 20,
    capacity: 20,
    registeredCount: 20,
    formsCompletedCount: 20,
    paidCount: 20,
  },
];

export default function TerminiListPage() {
  return (
    <AdminTerminiPageContent termini={PLACEHOLDER_TERMINI} pastTermini={PLACEHOLDER_PAST_TERMINI} />
  );
}
