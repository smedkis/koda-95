"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Eyebrow, Text } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";

export type TerminDriver = {
  id: string;
  driverName: string;
  email?: string;
  phone?: string;
  registrationDate?: string;
  dateOfBirth?: string;
  birthPlace?: string;
  birthCountry?: string;
  citizenship?: string;
  emso?: string;
  residenceType?: "permanent" | "temporary";
  streetAddress?: string;
  postalCode?: string;
  city?: string;
  categoryC?: boolean;
  categoryD?: boolean;
  categoryDPartial?: boolean;
  paymentMethod?: string;
  paymentAmount?: string;
  paymentReference?: string;
  formStatus: "izpolnjen" | "manjka";
  paymentStatus: "caka" | "poslano" | "poravnano";
  payer: "sam" | string;
  events?: { message: string; timestamp: string }[];
  registrationSource?: string;
};

export function formatDriverCategory(driver: TerminDriver): string {
  const parts = [
    ...(driver.categoryC ? ["C"] : []),
    ...(driver.categoryD ? ["D"] : []),
    ...(driver.categoryDPartial ? ["D - delno"] : []),
  ];
  return parts.length > 0 ? parts.join("+") : "—";
}

const COLUMNS = ["Voznik", "Kategorija", "Obrazec", "Plačilo", "Plačnik"];
const PAGE_SIZE_OPTIONS = [10, 50, 100];

function FormBadge({ status }: { status: TerminDriver["formStatus"] }) {
  if (status === "izpolnjen") {
    return (
      <span className="inline-flex shrink-0 items-center rounded bg-[#E5FBF5] px-2 py-1 font-body text-[12px] font-semibold uppercase text-secondary-dark">
        Izpolnjen
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center rounded bg-[#FFF4CC] px-2 py-1 font-body text-[12px] font-semibold uppercase text-[#8A6800]">
      Manjka
    </span>
  );
}

function PaymentBadge({ status }: { status: TerminDriver["paymentStatus"] }) {
  if (status === "poravnano") {
    return (
      <span className="inline-flex shrink-0 items-center rounded bg-[#E5FBF5] px-2 py-1 font-body text-[12px] font-semibold uppercase text-secondary-dark">
        Poravnano
      </span>
    );
  }
  if (status === "poslano") {
    return (
      <span className="inline-flex shrink-0 items-center rounded bg-[#F0F0F0] px-2 py-1 font-body text-[12px] font-semibold uppercase text-paragraph">
        Poslano
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center rounded bg-[#FFF4CC] px-2 py-1 font-body text-[12px] font-semibold uppercase text-[#8A6800]">
      Čaka
    </span>
  );
}

export function AdminTerminDriversTable({
  terminId,
  drivers,
}: {
  terminId: string;
  drivers: TerminDriver[];
}) {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(drivers.length / pageSize));
  const clampedPage = Math.min(currentPage, totalPages);

  const paginatedDrivers = useMemo(() => {
    const start = (clampedPage - 1) * pageSize;
    return drivers.slice(start, start + pageSize);
  }, [drivers, clampedPage, pageSize]);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-divider bg-white">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-divider">
              {COLUMNS.map((label) => (
                <th key={label} className="px-4 py-4 text-left">
                  <Eyebrow className="text-[14px]">{label}</Eyebrow>
                </th>
              ))}
              <th className="sticky right-0 bg-white px-4 py-4 sm:static sm:bg-transparent" />
            </tr>
          </thead>
          <tbody>
            {paginatedDrivers.map((driver, index) => (
              <tr
                key={driver.id}
                className={cn(
                  "group hover:bg-secondary-bg",
                  index < paginatedDrivers.length - 1 && "border-b border-divider",
                )}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <Text className="text-[14px]">{driver.driverName}</Text>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Text className="text-[14px]">{formatDriverCategory(driver)}</Text>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <FormBadge status={driver.formStatus} />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <PaymentBadge status={driver.paymentStatus} />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Text className="text-[14px]">
                    {driver.payer === "sam" ? "Sam" : driver.payer}
                  </Text>
                </td>
                <td className="sticky right-0 bg-white px-4 py-4 text-right group-hover:bg-secondary-bg sm:static sm:bg-transparent">
                  <Link
                    href={`/admin/termini/${terminId}/vozniki/${driver.id}`}
                    aria-label={`Uredi ${driver.driverName}`}
                    className="inline-flex cursor-pointer items-center hover:opacity-60"
                  >
                    <Image
                      src="/Edit.svg"
                      alt=""
                      width={16}
                      height={16}
                      className="size-4 shrink-0"
                    />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {drivers.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Text className="text-[14px] text-placeholder">Ni prijavljenih voznikov.</Text>
          </div>
        ) : null}
      </div>
      {drivers.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded border border-divider bg-[#F0F0F0] p-1">
            {PAGE_SIZE_OPTIONS.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handlePageSizeChange(size)}
                className={cn(
                  "cursor-pointer rounded px-3 py-1.5 font-body text-[14px] font-medium",
                  pageSize === size ? "bg-white text-heading" : "text-placeholder",
                )}
              >
                {size}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "flex size-8 cursor-pointer items-center justify-center rounded font-body text-[14px] font-medium",
                  page === clampedPage
                    ? "bg-paragraph text-white"
                    : "text-paragraph hover:bg-secondary-bg",
                )}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
