import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { AdminStatistikaPageContent } from "@/components/admin/AdminStatistikaPageContent";
import { getAllRegistrations } from "@/lib/data/registrations";

// This page has no cookies/headers/searchParams usage, so without this
// Next.js could treat it as eligible for build-time static optimization —
// fine in dev (which always renders fresh regardless), but that's exactly
// the gap that let production show a stale registrations list after a
// public registration came in through a path nothing had revalidated.
export const dynamic = "force-dynamic";

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
