import type { Metadata } from "next";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { AdminTerminForm } from "@/components/admin/AdminTerminForm";
import { Heading2 } from "@/components/ui/Typography";

export const metadata: Metadata = {
  title: "Dodaj termin | Koda 95 Admin",
  robots: { index: false, follow: false },
};

export default async function DodajTerminPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  return (
    <div className="mt-12 mb-24 lg:mt-20 lg:mb-32">
      <AdminBreadcrumbs
        items={[{ label: "Termini", href: "/admin/termini" }, { label: "Dodaj termin" }]}
      />
      <Heading2>Dodaj termin</Heading2>
      <AdminTerminForm initialDate={date} />
    </div>
  );
}
