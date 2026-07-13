import type { Metadata } from "next";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { ObvescanjePageContent } from "@/components/admin/ObvescanjePageContent";
import { getNarocniki } from "@/lib/data/narocniki";

export const metadata: Metadata = {
  title: "Obveščanje | Koda 95 Admin",
  robots: { index: false, follow: false },
};

export default async function ObvescanjeListPage() {
  const entries = await getNarocniki();

  return (
    <div className="mt-12 mb-24 lg:mt-20 lg:mb-32">
      <AdminBreadcrumbs
        items={[{ label: "Termini", href: "/admin/termini" }, { label: "Obveščanje" }]}
      />
      <ObvescanjePageContent initialEntries={entries} />
    </div>
  );
}
