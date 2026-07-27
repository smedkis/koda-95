import type { Metadata } from "next";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { UvozZgodovinePageContent } from "@/components/admin/UvozZgodovinePageContent";

export const metadata: Metadata = {
  title: "Uvoz preteklih usposabljanj | Koda 95 Admin",
  robots: { index: false, follow: false },
};

export default function UvozZgodovinePage() {
  return (
    <div className="mt-12 mb-24 lg:mt-20 lg:mb-32">
      <AdminBreadcrumbs
        items={[{ label: "Termini", href: "/admin/termini" }, { label: "Uvoz zgodovine" }]}
      />
      <UvozZgodovinePageContent />
    </div>
  );
}
