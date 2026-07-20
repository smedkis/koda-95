"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Eyebrow, Heading2, Heading3, Text } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import type { DriverSearchResult } from "@/lib/data/registrations";
import { generateRegistrationsPdf } from "@/lib/generate-registrations-pdf";

const PAGE_SIZE_OPTIONS = [10, 50, 100];
const ALL_MONTHS = "all";

const MONTH_NAMES = [
  "Januar",
  "Februar",
  "Marec",
  "April",
  "Maj",
  "Junij",
  "Julij",
  "Avgust",
  "September",
  "Oktober",
  "November",
  "December",
];

function parseRegistrationDate(value: string | undefined): Date | null {
  if (!value) return null;
  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

type MonthlyCount = { key: string; label: string; count: number; completed: number; missing: number };

function buildMonthlyCounts(registrations: DriverSearchResult[]): MonthlyCount[] {
  const counts = new Map<string, { completed: number; missing: number }>();
  for (const { driver } of registrations) {
    const date = parseRegistrationDate(driver.registrationDate);
    if (!date) continue;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const current = counts.get(key) ?? { completed: 0, missing: 0 };
    if (driver.formStatus === "izpolnjen") current.completed += 1;
    else current.missing += 1;
    counts.set(key, current);
  }
  return Array.from(counts.entries())
    .map(([key, { completed, missing }]) => {
      const [year, month] = key.split("-").map(Number);
      return {
        key,
        label: `${MONTH_NAMES[month - 1]} ${year}`,
        count: completed + missing,
        completed,
        missing,
      };
    })
    .sort((a, b) => b.key.localeCompare(a.key));
}

export function AdminStatistikaPageContent({
  registrations,
}: {
  registrations: DriverSearchResult[];
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [exportMonth, setExportMonth] = useState(ALL_MONTHS);

  const monthlyCounts = useMemo(() => buildMonthlyCounts(registrations), [registrations]);
  // Not very useful yet with only a few months of data, but once
  // registrations span years this keeps the chart from becoming an
  // unreadable wall of bars — defaults to showing everything available.
  const [visibleMonths, setVisibleMonths] = useState(() => monthlyCounts.length || 1);
  const maxVisibleMonths = Math.max(1, monthlyCounts.length);
  const clampedVisibleMonths = Math.min(visibleMonths, maxVisibleMonths);
  // monthlyCounts is newest-first; take the most recent N, then the dropdown
  // lists most-recent-first but a chart reads left-to-right as time moving
  // forward, so the bars themselves go oldest → newest.
  const chartMonths = useMemo(
    () => [...monthlyCounts.slice(0, clampedVisibleMonths)].reverse(),
    [monthlyCounts, clampedVisibleMonths],
  );
  const maxCount = Math.max(1, ...chartMonths.map((entry) => entry.count));

  const sortedRegistrations = useMemo(
    () =>
      [...registrations].sort((a, b) => {
        const dateA = parseRegistrationDate(a.driver.registrationDate)?.getTime() ?? 0;
        const dateB = parseRegistrationDate(b.driver.registrationDate)?.getTime() ?? 0;
        return dateB - dateA;
      }),
    [registrations],
  );

  const totalPages = Math.max(1, Math.ceil(sortedRegistrations.length / pageSize));
  const clampedPage = Math.min(currentPage, totalPages);

  const paginatedRegistrations = useMemo(() => {
    const start = (clampedPage - 1) * pageSize;
    return sortedRegistrations.slice(start, start + pageSize);
  }, [sortedRegistrations, clampedPage, pageSize]);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleExport = async () => {
    const monthLabel = monthlyCounts.find((entry) => entry.key === exportMonth)?.label;
    const toExport =
      exportMonth === ALL_MONTHS
        ? sortedRegistrations
        : sortedRegistrations.filter(({ driver }) => {
            const date = parseRegistrationDate(driver.registrationDate);
            if (!date) return false;
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            return key === exportMonth;
          });

    setIsExporting(true);
    try {
      await generateRegistrationsPdf(toExport, monthLabel);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Heading2>Statistika prijav</Heading2>
        <div className="flex items-center gap-3">
          <Select
            className="w-full sm:w-48"
            value={exportMonth}
            onChange={(event) => setExportMonth(event.target.value)}
          >
            <option value={ALL_MONTHS}>Vsi meseci</option>
            {monthlyCounts.map((entry) => (
              <option key={entry.key} value={entry.key}>
                {entry.label}
              </option>
            ))}
          </Select>
          <Button
            type="button"
            variant="action"
            className="shrink-0 whitespace-nowrap"
            icon={<Image src="/icon-print.svg" alt="" width={16} height={16} />}
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? "Izvažam …" : "Izvoz"}
          </Button>
        </div>
      </div>

      <div className="mt-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Heading3>Prijave po mesecih</Heading3>
          {maxVisibleMonths > 1 ? (
            <div className="flex items-center gap-3">
              <Text className="text-[13px] whitespace-nowrap text-placeholder">
                Zadnjih {clampedVisibleMonths} {clampedVisibleMonths === 1 ? "mesec" : "mesecev"}
              </Text>
              <input
                type="range"
                min={1}
                max={maxVisibleMonths}
                value={clampedVisibleMonths}
                onChange={(event) => setVisibleMonths(Number(event.target.value))}
                className="w-32 accent-primary"
              />
            </div>
          ) : null}
        </div>
        <Box className="mt-6 bg-white">
          {chartMonths.length > 0 ? (
            <>
              <div className="flex items-end gap-6 overflow-x-auto pb-1">
                {chartMonths.map((entry) => {
                  const totalHeight = Math.max(6, (entry.count / maxCount) * 100);
                  const completedHeight =
                    entry.count > 0 ? (totalHeight * entry.completed) / entry.count : 0;
                  const missingHeight = totalHeight - completedHeight;
                  return (
                    <div
                      key={entry.key}
                      className="flex min-w-[64px] flex-1 flex-col items-center gap-3"
                    >
                      <Text className="text-[16px] font-medium">{entry.count}</Text>
                      <div className="flex h-36 w-full flex-col justify-end">
                        {missingHeight > 0 ? (
                          <div
                            className={cn(
                              "w-full bg-primary opacity-40",
                              entry.completed === 0 && "rounded-t",
                            )}
                            style={{ height: `${missingHeight}%` }}
                          />
                        ) : null}
                        {completedHeight > 0 ? (
                          <div
                            className={cn(
                              "w-full bg-primary",
                              missingHeight === 0 && "rounded-t",
                            )}
                            style={{ height: `${completedHeight}%` }}
                          />
                        ) : null}
                      </div>
                      <Text className="text-center text-[12px] whitespace-nowrap text-placeholder">
                        {entry.label}
                      </Text>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex items-center justify-center gap-6 border-t border-divider pt-4">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-sm bg-primary" />
                  <Text className="text-[13px] text-placeholder">Izpolnjen obrazec</Text>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-sm bg-primary opacity-40" />
                  <Text className="text-[13px] text-placeholder">Brez obrazca</Text>
                </div>
              </div>
            </>
          ) : (
            <Text className="text-[14px] text-placeholder">Ni podatkov o prijavah.</Text>
          )}
        </Box>
      </div>

      <div className="mt-16">
        <Heading3>Vse prijave ({sortedRegistrations.length})</Heading3>
        <div className="mt-6 overflow-x-auto rounded-lg border border-divider bg-white">
          <table className="w-full min-w-[560px] border-collapse">
            <thead>
              <tr className="border-b border-divider">
                {["Št.", "Voznik", "Datum prijave", "Termin", "Vir"].map((label) => (
                  <th key={label} className="px-4 py-4 text-left">
                    <Eyebrow className="text-[14px]">{label}</Eyebrow>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRegistrations.map(({ driver, terminId, terminTitle }, index) => (
                <tr
                  key={`${terminId}-${driver.id}`}
                  className={
                    index < paginatedRegistrations.length - 1
                      ? "border-b border-divider hover:bg-secondary-bg"
                      : "hover:bg-secondary-bg"
                  }
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Text className="text-[14px]">
                      {(clampedPage - 1) * pageSize + index + 1}
                    </Text>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Text className="text-[14px]">{driver.driverName}</Text>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Text className="text-[14px]">{driver.registrationDate ?? "—"}</Text>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Link href={`/admin/termini/${terminId}`} className="hover:underline">
                      <Text className="text-[14px]">{terminTitle}</Text>
                    </Link>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Text className="text-[14px]">{driver.registrationSource ?? "—"}</Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sortedRegistrations.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <Text className="text-[14px] text-placeholder">Ni prijav.</Text>
            </div>
          ) : null}
        </div>
        {sortedRegistrations.length > 0 ? (
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
    </div>
  );
}
