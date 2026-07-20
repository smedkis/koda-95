import type { Metadata } from "next";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { ObvescanjePageContent } from "@/components/admin/ObvescanjePageContent";
import { getNarocniki } from "@/lib/data/narocniki";

export const metadata: Metadata = {
  title: "Obveščanje | Koda 95 Admin",
  robots: { index: false, follow: false },
};

// Admin data changes from paths this page never gets a revalidatePath call
// for (e.g. public registrations) — force-dynamic means every request reads
// live from Supabase instead of relying on Next's Data/Full Route Cache to
// have been told to invalidate.
export const dynamic = "force-dynamic";

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
