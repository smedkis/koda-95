"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminTerminForm } from "@/components/admin/AdminTerminForm";
import {
  getAddedTermini,
  getTerminOverrides,
  parseModul,
  parseSlovenianDate,
  parseTimeRange,
  type StoredTermin,
} from "@/lib/admin-termini-store";
import { Heading2, Text } from "@/components/ui/Typography";
import { PLACEHOLDER_PAST_TERMINI, PLACEHOLDER_TERMINI } from "@/lib/admin-termini-data";

function resolveTermin(id: string): StoredTermin | null {
  const overrides = getTerminOverrides();
  if (overrides[id]) return overrides[id];

  const added = getAddedTermini().find((entry) => entry.id === id);
  if (added) return added;

  const base =
    PLACEHOLDER_TERMINI.find((entry) => entry.id === id) ??
    PLACEHOLDER_PAST_TERMINI.find((entry) => entry.id === id) ??
    null;
  if (!base) return null;

  const { start, end } = parseTimeRange(base.timeRange);
  return {
    ...base,
    dateISO: parseSlovenianDate(base.date),
    startTime: start,
    endTime: end,
    modul: base.program === "redna" ? parseModul(base.title) : undefined,
  };
}

export default function UrediTerminPage() {
  const params = useParams<{ termin: string }>();
  const id = params.termin;
  const [termin, setTermin] = useState<StoredTermin | null | undefined>(undefined);

  useEffect(() => {
    setTermin(resolveTermin(id));
  }, [id]);

  if (termin === undefined) return null;

  if (termin === null) {
    return (
      <div className="mt-24 mb-24 lg:mt-32 lg:mb-32">
        <AdminBackLink href="/admin/termini" label="Termini" />
        <Heading2 className="mt-4">Termin ne obstaja</Heading2>
        <Text className="mt-4">Termina s to povezavo ni bilo mogoče najti.</Text>
      </div>
    );
  }

  return (
    <div className="mt-24 mb-24 lg:mt-32 lg:mb-32">
      <AdminBackLink href="/admin/termini" label="Termini" />
      <Heading2 className="mt-4">Uredi termin</Heading2>
      <AdminTerminForm initialTermin={termin} />
    </div>
  );
}
