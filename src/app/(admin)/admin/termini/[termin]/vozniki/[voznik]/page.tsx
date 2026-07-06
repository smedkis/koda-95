"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminVoznikEditContent } from "@/components/admin/AdminVoznikEditContent";
import type { TerminDriver } from "@/components/admin/AdminTerminDriversTable";
import { Heading2, Text } from "@/components/ui/Typography";
import { PLACEHOLDER_DRIVERS } from "@/lib/admin-drivers-data";
import { getDriversForTermin } from "@/lib/admin-drivers-store";

export default function UrediVoznikPage() {
  const params = useParams<{ termin: string; voznik: string }>();
  const terminId = params.termin;
  const voznikId = params.voznik;
  const [driver, setDriver] = useState<TerminDriver | null | undefined>(undefined);

  useEffect(() => {
    const drivers = getDriversForTermin(terminId, PLACEHOLDER_DRIVERS);
    setDriver(drivers.find((entry) => entry.id === voznikId) ?? null);
  }, [terminId, voznikId]);

  if (driver === undefined) return null;

  if (driver === null) {
    return (
      <div className="mt-32 mb-32">
        <AdminBackLink href={`/admin/termini/${terminId}`} label="Termin" />
        <Heading2 className="mt-4">Voznik ne obstaja</Heading2>
        <Text className="mt-4">Voznika s to povezavo ni bilo mogoče najti.</Text>
      </div>
    );
  }

  return (
    <div className="mt-32 mb-32">
      <AdminBackLink href={`/admin/termini/${terminId}`} label="Termin" />
      <Heading2 className="mt-4">{driver.driverName}</Heading2>
      <AdminVoznikEditContent terminId={terminId} initialDriver={driver} />
    </div>
  );
}
