"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { AdminTerminCardProps } from "./AdminTerminCard";
import {
  AdminTerminDriversTable,
  type TerminDriver,
} from "./AdminTerminDriversTable";
import { Button } from "@/components/ui/Button";
import { Heading2, Heading3, Text } from "@/components/ui/Typography";
import {
  getAddedTermini,
  getTerminOverrides,
  parseModul,
  type StoredTermin,
} from "@/lib/admin-termini-store";

type BaseTermin = AdminTerminCardProps & { program: "redna" | "zacetna" };

// Placeholder data — will be replaced with a real Supabase query filtered
// by the termin id. Respects the rule that a missing form always implies
// payment status "čaka" (a driver can't have paid or been sent a payment
// before they've even filled out the registration form).
const PLACEHOLDER_DRIVERS: TerminDriver[] = [
  {
    id: "1",
    driverName: "Janez Novak",
    category: "C",
    formStatus: "izpolnjen",
    paymentStatus: "poravnano",
    payer: "sam",
  },
  {
    id: "2",
    driverName: "Ana Kovač",
    category: "D",
    formStatus: "izpolnjen",
    paymentStatus: "poslano",
    payer: "Kobal d.o.o.",
  },
  {
    id: "3",
    driverName: "Marko Zupan",
    category: "C+D",
    formStatus: "manjka",
    paymentStatus: "caka",
    payer: "sam",
  },
  {
    id: "4",
    driverName: "Petra Horvat",
    category: "C",
    formStatus: "izpolnjen",
    paymentStatus: "poravnano",
    payer: "Arriva",
  },
  {
    id: "5",
    driverName: "Luka Bregar",
    category: "D",
    formStatus: "izpolnjen",
    paymentStatus: "caka",
    payer: "sam",
  },
  {
    id: "6",
    driverName: "Nina Potočnik",
    category: "C",
    formStatus: "manjka",
    paymentStatus: "caka",
    payer: "sam",
  },
  {
    id: "7",
    driverName: "Rok Kranjc",
    category: "C+D",
    formStatus: "izpolnjen",
    paymentStatus: "poslano",
    payer: "Jurenič Transport",
  },
  {
    id: "8",
    driverName: "Maja Vidmar",
    category: "D",
    formStatus: "izpolnjen",
    paymentStatus: "poravnano",
    payer: "sam",
  },
];

export function AdminTerminDetailContent({
  id,
  baseTermin,
}: {
  id: string;
  baseTermin: BaseTermin | null;
}) {
  const [termin, setTermin] = useState<BaseTermin | StoredTermin | null>(baseTermin);

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

  if (!termin) {
    return <Text className="mt-4">Termina ni bilo mogoče najti.</Text>;
  }

  const cleanTitle = termin.title.replace(/\s*\([^)]*\)\s*$/, "");
  const modul = termin.program === "redna" ? parseModul(termin.title) : undefined;

  return (
    <>
      <div className="mt-4 flex items-center justify-between">
        <Heading2>{cleanTitle}</Heading2>
        <Link
          href={`/admin/termini/${id}/uredi`}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-primary px-[14px] py-[10px] font-body text-[16px] font-medium text-white transition-colors hover:bg-black hover:text-white"
        >
          <Image src="/Edit-white.svg" alt="" width={16} height={16} className="size-4 shrink-0" />
          Uredi
        </Link>
      </div>
      <div className="mt-4 flex items-center gap-6">
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
      <div className="mt-16 flex items-center justify-between">
        <Heading3>Prijavljeni vozniki ({PLACEHOLDER_DRIVERS.length})</Heading3>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="action"
            icon={<Image src="/plus.svg" alt="" width={13} height={13} />}
          >
            Dodaj
          </Button>
          <Button
            type="button"
            variant="action"
            icon={<Image src="/icon-print.svg" alt="" width={16} height={16} />}
          >
            Izvoz
          </Button>
        </div>
      </div>
      <div className="mt-6">
        <AdminTerminDriversTable drivers={PLACEHOLDER_DRIVERS} />
      </div>
    </>
  );
}
