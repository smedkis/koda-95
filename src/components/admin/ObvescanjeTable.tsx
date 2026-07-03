"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Eyebrow, Heading3, Text } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";

export type ObvescanjeEnrollment =
  | { status: "enrolled"; date: string }
  | { status: "was_enrolled"; date: string }
  | { status: "never" };

export type ObvescanjeEntry = {
  id: string;
  driverName: string;
  email: string;
  phone: string;
  dateAdded: string;
  source: string;
  lastNotified: string | null;
  enrollment: ObvescanjeEnrollment;
};

type SortKey = "driverName" | "email" | "phone" | "dateAdded" | "source" | "lastNotified";
type SortDirection = "asc" | "desc";

const PAGE_SIZE_OPTIONS = [10, 50, 100];

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "driverName", label: "Voznik" },
  { key: "email", label: "E-pošta" },
  { key: "phone", label: "Tel. št." },
  { key: "dateAdded", label: "Dodan" },
  { key: "source", label: "Vir" },
  { key: "lastNotified", label: "Zadnje obv." },
];

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4 shrink-0">
      <path
        d="M4 4L12 12M12 4L4 12"
        stroke="black"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SortIcon({ direction }: { direction: SortDirection | null }) {
  return (
    <svg viewBox="0 0 10 10" fill="none" aria-hidden="true" className="size-3 shrink-0">
      <path
        d="M2 4L5 1L8 4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={direction === "asc" ? 1 : 0.3}
      />
      <path
        d="M2 6L5 9L8 6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={direction === "desc" ? 1 : 0.3}
      />
    </svg>
  );
}

function EnrollmentBadge({ enrollment }: { enrollment: ObvescanjeEnrollment }) {
  if (enrollment.status === "enrolled") {
    return (
      <span className="inline-flex shrink-0 items-center rounded bg-[#E5FBF5] px-2 py-1 font-body text-[12px] font-semibold uppercase text-secondary-dark">
        Prijavljen
      </span>
    );
  }
  if (enrollment.status === "was_enrolled") {
    return (
      <span className="inline-flex shrink-0 items-center rounded bg-[#FFF4CC] px-2 py-1 font-body text-[12px] font-semibold uppercase text-[#8A6800]">
        Bil prijavljen · {formatDate(enrollment.date)}
      </span>
    );
  }
  return <Text className="text-[14px] text-placeholder">Ni bil prijavljen</Text>;
}

export function ObvescanjeTable({
  entries,
  onDelete,
}: {
  entries: ObvescanjeEntry[];
  onDelete: (id: string) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("dateAdded");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const pendingDeleteRow = entries.find((row) => row.id === pendingDeleteId) ?? null;
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const sortedRows = useMemo(() => {
    const copy = [...entries];
    copy.sort((a, b) => {
      const aValue = a[sortKey] ?? "";
      const bValue = b[sortKey] ?? "";
      const comparison = aValue.localeCompare(bValue, "sl");
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return copy;
  }, [entries, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const clampedPage = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (clampedPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, clampedPage, pageSize]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const confirmDelete = () => {
    if (pendingDeleteId) {
      onDelete(pendingDeleteId);
    }
    setPendingDeleteId(null);
  };

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-divider bg-white">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-divider">
            {COLUMNS.map((column) => (
              <th key={column.key} className="px-4 py-4 text-left">
                <button
                  type="button"
                  onClick={() => handleSort(column.key)}
                  className="flex cursor-pointer items-center gap-1.5"
                >
                  <Eyebrow className="text-[14px]">{column.label}</Eyebrow>
                  <SortIcon direction={sortKey === column.key ? sortDirection : null} />
                </button>
              </th>
            ))}
            <th className="px-4 py-4 text-left">
              <Eyebrow className="text-[14px]">Prijava</Eyebrow>
            </th>
            <th className="px-4 py-4" />
          </tr>
        </thead>
        <tbody>
          {paginatedRows.map((row, index) => (
            <tr
              key={row.id}
              className={cn(
                "hover:bg-secondary-bg",
                index < paginatedRows.length - 1 && "border-b border-divider",
              )}
            >
              <td className="px-4 py-4 whitespace-nowrap">
                <Text className="text-[14px]">{row.driverName}</Text>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <Text className="text-[14px]">{row.email}</Text>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <Text className="text-[14px]">{row.phone}</Text>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <Text className="text-[14px]">{formatDate(row.dateAdded)}</Text>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <Text className="text-[14px]">{row.source}</Text>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <Text className="text-[14px]">{formatDate(row.lastNotified)}</Text>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <EnrollmentBadge enrollment={row.enrollment} />
              </td>
              <td className="px-4 py-4 text-right">
                <button
                  type="button"
                  onClick={() => setPendingDeleteId(row.id)}
                  aria-label={`Izbriši ${row.driverName}`}
                  className="inline-flex cursor-pointer items-center hover:opacity-60"
                >
                  <Image src="/Delete.svg" alt="" width={16} height={16} className="size-4 shrink-0" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sortedRows.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Text className="text-[14px] text-placeholder">Ni naročenih.</Text>
        </div>
      ) : null}
      </div>
      {sortedRows.length > 0 ? (
        <div className="mt-4 flex items-center justify-between">
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
      {pendingDeleteRow ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setPendingDeleteId(null)}
        >
          <div
            className="relative w-full max-w-[380px] rounded-lg border border-divider bg-white p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPendingDeleteId(null)}
              aria-label="Zapri"
              className="absolute top-4 right-4 cursor-pointer"
            >
              <CloseIcon />
            </button>
            <Heading3>Izbriši vnos</Heading3>
            <Text className="mt-4">
              Ali ste prepričani, da želite izbrisati {pendingDeleteRow.driverName}? Tega
              dejanja ni mogoče razveljaviti.
            </Text>
            <Button
              type="button"
              variant="primary"
              className="mt-8 w-full justify-center"
              onClick={confirmDelete}
            >
              Izbriši
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
