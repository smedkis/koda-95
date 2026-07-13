"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { AdminVoznikEditContent } from "@/components/admin/AdminVoznikEditContent";
import type { TerminDriver } from "@/components/admin/AdminTerminDriversTable";
import { Heading2, Text } from "@/components/ui/Typography";
import { PLACEHOLDER_DRIVERS } from "@/lib/admin-drivers-data";
import { getDriversForTermin } from "@/lib/admin-drivers-store";
import { PLACEHOLDER_PAST_TERMINI, PLACEHOLDER_TERMINI } from "@/lib/admin-termini-data";
import { getAddedTermini, getTerminOverrides } from "@/lib/admin-termini-store";

// TODO(stage 3): this whole page still resolves termin + drivers from the
// localStorage placeholders — will be rewired alongside the driver table.
function resolveTerminTitle(id: string): string | null {
  const overrides = getTerminOverrides();
  if (overrides[id]) return overrides[id].title;

  const added = getAddedTermini().find((entry) => entry.id === id);
  if (added) return added.title;

  const base =
    PLACEHOLDER_TERMINI.find((entry) => entry.id === id) ??
    PLACEHOLDER_PAST_TERMINI.find((entry) => entry.id === id) ??
    null;
  return base?.title ?? null;
}

export default function UrediVoznikPage() {
  const params = useParams<{ termin: string; voznik: string }>();
  const terminId = params.termin;
  const voznikId = params.voznik;
  const [driver, setDriver] = useState<TerminDriver | null | undefined>(undefined);
  const [terminTitle, setTerminTitle] = useState<string | null>(null);

  useEffect(() => {
    const drivers = getDriversForTermin(terminId, PLACEHOLDER_DRIVERS);
    setDriver(drivers.find((entry) => entry.id === voznikId) ?? null);
    setTerminTitle(resolveTerminTitle(terminId));
  }, [terminId, voznikId]);

  if (driver === undefined) return null;

  const cleanTerminTitle = terminTitle?.replace(/\s*\([^)]*\)\s*$/, "") ?? "Termin";

  if (driver === null) {
    return (
      <div className="mt-12 mb-24 lg:mt-20 lg:mb-32">
        <AdminBreadcrumbs
          items={[
            { label: "Termini", href: "/admin/termini" },
            { label: cleanTerminTitle, href: `/admin/termini/${terminId}` },
          ]}
        />
        <Heading2>Voznik ne obstaja</Heading2>
        <Text className="mt-4">Voznika s to povezavo ni bilo mogoče najti.</Text>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-24 lg:mt-20 lg:mb-32">
      <AdminBreadcrumbs
        items={[
          { label: "Termini", href: "/admin/termini" },
          { label: cleanTerminTitle, href: `/admin/termini/${terminId}` },
          { label: driver.driverName },
        ]}
      />
      <Heading2>{driver.driverName}</Heading2>
      <AdminVoznikEditContent terminId={terminId} initialDriver={driver} />
    </div>
  );
}
