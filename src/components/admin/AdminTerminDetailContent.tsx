"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AddVoznikModal } from "./AddVoznikModal";
import { AdminBreadcrumbs } from "./AdminBreadcrumbs";
import {
  AdminTerminDriversTable,
  type TerminDriver,
} from "./AdminTerminDriversTable";
import { Button } from "@/components/ui/Button";
import { Heading2, Heading3, Text } from "@/components/ui/Typography";
import { parseModul } from "@/lib/termini-format";
import { formatToday } from "@/lib/date-format";
import { generateAttendancePdf } from "@/lib/generate-attendance-pdf";
import type { TerminFormData } from "@/lib/data/termini";
import { createRegistrationAction } from "@/app/(admin)/admin/termini/[termin]/actions";

export function AdminTerminDetailContent({
  id,
  termin,
  initialDrivers,
}: {
  id: string;
  termin: TerminFormData | null;
  initialDrivers: TerminDriver[];
}) {
  const [drivers, setDrivers] = useState<TerminDriver[]>(initialDrivers);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!termin) {
    return (
      <>
        <AdminBreadcrumbs items={[{ label: "Termini", href: "/admin/termini" }]} />
        <Text className="mt-4">Termina ni bilo mogoče najti.</Text>
      </>
    );
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
        address: termin.address ?? "Po dogovoru",
        drivers,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <AdminBreadcrumbs
        items={[{ label: "Termini", href: "/admin/termini" }, { label: cleanTitle }]}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          <Text>{termin.timeRange ?? "Po dogovoru"}</Text>
        </div>
        <div className="flex items-center gap-2">
          <Image src="/icon-location.svg" alt="" width={20} height={20} className="size-5" />
          <Text>{termin.address ?? "Po dogovoru"}</Text>
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
          error={addError}
          onAdd={async (input) => {
            setAddError(null);
            const result = await createRegistrationAction(id, input);
            if ("error" in result) {
              setAddError(result.error);
              return;
            }
            setDrivers((current) => [
              {
                id: result.id,
                driverName: input.fullName,
                email: input.email,
                phone: input.phone,
                registrationDate: formatToday(),
                formStatus: "manjka",
                paymentStatus: "caka",
                payer: "sam",
              },
              ...current,
            ]);
            setIsAddOpen(false);
          }}
          onClose={() => {
            setAddError(null);
            setIsAddOpen(false);
          }}
        />
      ) : null}
    </>
  );
}
