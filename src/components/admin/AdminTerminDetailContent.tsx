"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AddVoznikModal } from "./AddVoznikModal";
import type { AdminTerminCardProps } from "./AdminTerminCard";
import {
  AdminTerminDriversTable,
  type TerminDriver,
} from "./AdminTerminDriversTable";
import { Button } from "@/components/ui/Button";
import { Heading2, Heading3, Text } from "@/components/ui/Typography";
import { addDriverToTermin, getDriversForTermin } from "@/lib/admin-drivers-store";
import { PLACEHOLDER_DRIVERS } from "@/lib/admin-drivers-data";
import {
  getAddedTermini,
  getTerminOverrides,
  parseModul,
  type StoredTermin,
} from "@/lib/admin-termini-store";
import { generateAttendancePdf } from "@/lib/generate-attendance-pdf";

type BaseTermin = AdminTerminCardProps & { program: "redna" | "zacetna" };

export function AdminTerminDetailContent({
  id,
  baseTermin,
}: {
  id: string;
  baseTermin: BaseTermin | null;
}) {
  const [termin, setTermin] = useState<BaseTermin | StoredTermin | null>(baseTermin);
  const [drivers, setDrivers] = useState<TerminDriver[]>(PLACEHOLDER_DRIVERS);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const overrides = getTerminOverrides();
    if (overrides[id]) {
      setTermin(overrides[id]);
      return;
    }
    const added = getAddedTermini().find((entry) => entry.id === id);
    if (added) {
      setTermin(added);
      return;
    }
    setTermin(baseTermin);
  }, [id, baseTermin]);

  useEffect(() => {
    setDrivers(getDriversForTermin(id, PLACEHOLDER_DRIVERS));
  }, [id]);

  if (!termin) {
    return <Text className="mt-4">Termina ni bilo mogoče najti.</Text>;
  }

  const cleanTitle = termin.title.replace(/\s*\([^)]*\)\s*$/, "");
  const modul = termin.program === "redna" ? parseModul(termin.title) : undefined;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await generateAttendancePdf({
        id,
        title: cleanTitle,
        modul,
        date: termin.date,
        address: termin.address,
        drivers,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Heading2>{cleanTitle}</Heading2>
        <Link
          href={`/admin/termini/${id}/uredi`}
          className="inline-flex w-fit shrink-0 cursor-pointer items-center justify-center gap-2 rounded bg-primary px-[14px] py-[10px] font-body text-[16px] font-medium whitespace-nowrap text-white transition-colors hover:bg-[#d06e1b]"
        >
          <Image
            src="/Edit-white.svg"
            alt=""
            width={16}
            height={16}
            className="size-4 shrink-0"
          />
          Uredi
        </Link>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
        {modul ? (
          <div className="flex items-center gap-2">
            <Image src="/Category.svg" alt="" width={20} height={20} className="size-5" />
            <Text>Modul {modul}</Text>
          </div>
        ) : null}
        <div className="flex items-center gap-2">
          <Image src="/icon-calendar.svg" alt="" width={20} height={20} className="size-5" />
          <Text>{termin.date}</Text>
        </div>
        <div className="flex items-center gap-2">
          <Image src="/icon-clock.svg" alt="" width={20} height={20} className="size-5" />
          <Text>{termin.timeRange}</Text>
        </div>
        <div className="flex items-center gap-2">
          <Image src="/icon-location.svg" alt="" width={20} height={20} className="size-5" />
          <Text>{termin.address}</Text>
        </div>
      </div>
      <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Heading3>Prijavljeni vozniki ({drivers.length})</Heading3>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="action"
            icon={<Image src="/plus.svg" alt="" width={13} height={13} />}
            onClick={() => setIsAddOpen(true)}
          >
            Dodaj
          </Button>
          <Button
            type="button"
            variant="action"
            icon={<Image src="/icon-print.svg" alt="" width={16} height={16} />}
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? "Izvažam …" : "Izvoz"}
          </Button>
        </div>
      </div>
      <div className="mt-6">
        <AdminTerminDriversTable terminId={id} drivers={drivers} />
      </div>
      {isAddOpen ? (
        <AddVoznikModal
          onAdd={(driver) => {
            addDriverToTermin(id, driver, PLACEHOLDER_DRIVERS);
            setDrivers((current) => [driver, ...current]);
          }}
          onClose={() => setIsAddOpen(false)}
        />
      ) : null}
    </>
  );
}
