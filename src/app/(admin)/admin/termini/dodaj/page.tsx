import type { Metadata } from "next";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminTerminForm } from "@/components/admin/AdminTerminForm";
import { Heading2 } from "@/components/ui/Typography";

export const metadata: Metadata = {
  title: "Dodaj termin | Koda 95 Admin",
  robots: { index: false, follow: false },
};

export default function DodajTerminPage() {
  return (
    <div className="mt-24 mb-24 lg:mt-32 lg:mb-32">
      <AdminBackLink href="/admin/termini" label="Termini" />
      <Heading2 className="mt-4">Dodaj termin</Heading2>
      <AdminTerminForm />
    </div>
  );
}
