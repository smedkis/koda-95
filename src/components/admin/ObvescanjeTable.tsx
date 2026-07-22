"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { Eyebrow, Heading3, Text } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { getPaginationRange } from "@/lib/pagination";

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
  { key: "lastNotified", label: "Poslano" },
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
  onUpdate,
}: {
  entries: ObvescanjeEntry[];
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    input: { name: string; email: string; phone: string },
  ) => Promise<{ error?: string }>;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("dateAdded");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const pendingDeleteRow = entries.find((row) => row.id === pendingDeleteId) ?? null;
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingRow = entries.find((row) => row.id === editingId) ?? null;
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
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

  const paginationRange = useMemo(
    () => getPaginationRange(clampedPage, totalPages),
    [clampedPage, totalPages],
  );

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

  const openEdit = (row: ObvescanjeEntry) => {
    setEditingId(row.id);
    setEditName(row.driverName);
    setEditEmail(row.email);
    setEditPhone(row.phone);
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setIsSavingEdit(true);
    setEditError(null);
    const result = await onUpdate(editingId, {
      name: editName,
      email: editEmail,
      phone: editPhone,
    });
    setIsSavingEdit(false);
    if (result.error) {
      setEditError(result.error);
      return;
    }
    setEditingId(null);
  };

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-divider bg-white">
      <table className="w-full min-w-[860px] border-collapse">
        <thead>
          <tr className="border-b border-divider bg-[#9eb0a2]">
            {COLUMNS.map((column) => (
              <th key={column.key} className="px-4 py-4 text-left">
                <button
                  type="button"
                  onClick={() => handleSort(column.key)}
                  className="flex cursor-pointer items-center gap-1.5 text-white"
                >
                  <Eyebrow className="text-[14px] text-white">{column.label}</Eyebrow>
                  <SortIcon direction={sortKey === column.key ? sortDirection : null} />
                </button>
              </th>
            ))}
            <th className="px-4 py-4 text-left">
              <Eyebrow className="text-[14px] text-white">Prijava</Eyebrow>
            </th>
            <th className="sticky right-0 bg-[#9eb0a2] px-4 py-4 sm:static" />
          </tr>
        </thead>
        <tbody>
          {paginatedRows.map((row, index) => (
            <tr
              key={row.id}
              onClick={() => openEdit(row)}
              className={cn(
                "group cursor-pointer hover:bg-secondary-bg",
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
              <td className="sticky right-0 bg-white px-4 py-4 text-right group-hover:bg-secondary-bg sm:static sm:bg-transparent">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openEdit(row);
                  }}
                  aria-label={`Uredi ${row.driverName}`}
                  className="inline-flex cursor-pointer items-center gap-1.5 hover:opacity-60"
                >
                  <Image src="/Edit.svg" alt="" width={16} height={16} className="size-4 shrink-0" />
                  <Text className="text-[14px]">Uredi</Text>
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
            {paginationRange.map((page, index) =>
              page === "dots" ? (
                <span
                  key={`dots-${index}`}
                  className="flex size-8 items-center justify-center font-body text-[14px] font-medium text-placeholder"
                >
                  …
                </span>
              ) : (
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
              ),
            )}
          </div>
        </div>
      ) : null}
      {editingRow ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setEditingId(null)}
        >
          <div
            className="relative w-full max-w-[420px] rounded-lg border border-divider bg-white p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setEditingId(null)}
              aria-label="Zapri"
              className="absolute top-4 right-4 cursor-pointer"
            >
              <CloseIcon />
            </button>
            <Heading3>Uredi naročnika</Heading3>
            <div className="mt-6 flex flex-col gap-6">
              <Input
                label="Ime in priimek"
                placeholder="Ime in priimek"
                inputClassName="bg-secondary-bg"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
              />
              <Input
                label="E-poštni naslov"
                placeholder="E-poštni naslov"
                type="email"
                required
                inputClassName="bg-secondary-bg"
                value={editEmail}
                onChange={(event) => setEditEmail(event.target.value)}
              />
              <PhoneInput
                label="Telefonska številka"
                inputClassName="bg-secondary-bg"
                value={editPhone}
                onChange={setEditPhone}
              />
            </div>
            {editError ? <Text className="mt-4 text-red-600">{editError}</Text> : null}
            <div className="mt-8 flex items-center justify-between">
              <Button
                type="button"
                variant="secondary"
                className="bg-white text-red-600 outline outline-1 outline-red-200 hover:bg-red-50"
                onClick={() => {
                  setPendingDeleteId(editingRow.id);
                  setEditingId(null);
                }}
              >
                Izbriši
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={editEmail.trim() === "" || isSavingEdit}
                onClick={handleSaveEdit}
              >
                {isSavingEdit ? "Shranjujem …" : "Shrani"}
              </Button>
            </div>
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
