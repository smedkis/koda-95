import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { AdminStatistikaPageContent } from "@/components/admin/AdminStatistikaPageContent";
import { getAllRegistrations } from "@/lib/data/registrations";

export default async function StatistikaPage() {
  const registrations = await getAllRegistrations();

  return (
    <div className="mt-12 mb-24 lg:mt-20 lg:mb-32">
      <AdminBreadcrumbs
        items={[{ label: "Termini", href: "/admin/termini" }, { label: "Statistika" }]}
      />
      <AdminStatistikaPageContent registrations={registrations} />
    </div>
  );
}
