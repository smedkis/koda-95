"use client";

import { useEffect, useState } from "react";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { AdminStatistikaPageContent } from "@/components/admin/AdminStatistikaPageContent";
import { getAllRegistrations, type DriverSearchResult } from "@/lib/admin-drivers-store";

export default function StatistikaPage() {
  const [registrations, setRegistrations] = useState<DriverSearchResult[]>([]);

  useEffect(() => {
    setRegistrations(getAllRegistrations());
  }, []);

  return (
    <div className="mt-12 mb-24 lg:mt-20 lg:mb-32">
      <AdminBreadcrumbs
        items={[{ label: "Termini", href: "/admin/termini" }, { label: "Statistika" }]}
      />
      <AdminStatistikaPageContent registrations={registrations} />
    </div>
  );
}
