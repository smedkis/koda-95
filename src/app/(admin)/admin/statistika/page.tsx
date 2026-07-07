"use client";

import { useEffect, useState } from "react";
import { AdminStatistikaPageContent } from "@/components/admin/AdminStatistikaPageContent";
import { getAllRegistrations, type DriverSearchResult } from "@/lib/admin-drivers-store";

export default function StatistikaPage() {
  const [registrations, setRegistrations] = useState<DriverSearchResult[]>([]);

  useEffect(() => {
    setRegistrations(getAllRegistrations());
  }, []);

  return (
    <div className="mt-24 mb-24 lg:mt-32 lg:mb-32">
      <AdminStatistikaPageContent registrations={registrations} />
    </div>
  );
}
