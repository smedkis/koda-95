"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { AdminTerminCardProps } from "./AdminTerminCard";
import { AdminTerminiGrid } from "./AdminTerminiGrid";
import { Heading2 } from "@/components/ui/Typography";
import { getAddedTermini, getTerminOverrides } from "@/lib/admin-termini-store";
import { cn } from "@/lib/cn";

type Program = "vsi" | "redna" | "zacetna";
type TerminEntry = AdminTerminCardProps & { program: Exclude<Program, "vsi"> };

const PROGRAM_OPTIONS: { value: Program; label: string }[] = [
  { value: "vsi", label: "Vsi termini" },
  { value: "redna", label: "Redna Koda 95" },
  { value: "zacetna", label: "Začetna Koda 95" },
];

function ProgramToggle({
  program,
  onChange,
}: {
  program: Program;
  onChange: (program: Program) => void;
}) {
  return (
    <div className="flex h-11 items-center gap-1 rounded border border-divider bg-[#F0F0F0] p-1">
      {PROGRAM_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "flex h-full cursor-pointer items-center rounded px-4 font-body text-[16px] font-medium",
            program === option.value ? "bg-white text-heading" : "text-placeholder",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function AdminTerminiPageContent({
  termini,
  pastTermini,
}: {
  termini: TerminEntry[];
  pastTermini: TerminEntry[];
}) {
  const [program, setProgram] = useState<Program>("vsi");
  const [allTermini, setAllTermini] = useState<TerminEntry[]>(termini);
  const [allPastTermini, setAllPastTermini] = useState<TerminEntry[]>(pastTermini);

  useEffect(() => {
    const overrides = getTerminOverrides();
    const added = getAddedTermini() as TerminEntry[];

    setAllTermini((current) => {
      const withOverrides = current.map((termin) =>
        overrides[termin.id] ? (overrides[termin.id] as TerminEntry) : termin,
      );
      const existingIds = new Set(withOverrides.map((termin) => termin.id));
      const newOnes = added.filter((termin) => !existingIds.has(termin.id));
      return [...withOverrides, ...newOnes];
    });

    setAllPastTermini((current) =>
      current.map((termin) => (overrides[termin.id] ? (overrides[termin.id] as TerminEntry) : termin)),
    );
  }, []);

  const filteredTermini =
    program === "vsi" ? allTermini : allTermini.filter((termin) => termin.program === program);
  const filteredPastTermini =
    program === "vsi"
      ? allPastTermini
      : allPastTermini.filter((termin) => termin.program === program);

  return (
    <div className="mt-32 mb-32">
      <div className="flex items-center justify-between">
        <Heading2>Termini</Heading2>
        <div className="flex items-center gap-4">
          <ProgramToggle program={program} onChange={setProgram} />
          <Link
            href="/admin/termini/dodaj"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-primary px-[14px] py-[10px] font-body text-[16px] font-medium text-white transition-colors hover:bg-[#d06e1b]"
          >
            <Image src="/plus.svg" alt="" width={14} height={14} className="size-4 shrink-0" />
            Dodaj termin
          </Link>
        </div>
      </div>
      <AdminTerminiGrid termini={filteredTermini} pastTermini={filteredPastTermini} />
    </div>
  );
}
