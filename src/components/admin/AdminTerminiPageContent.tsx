"use client";

import Image from "next/image";
import { useState } from "react";
import type { AdminTerminCardProps } from "./AdminTerminCard";
import { AdminTerminiGrid } from "./AdminTerminiGrid";
import { Button } from "@/components/ui/Button";
import { Heading2 } from "@/components/ui/Typography";
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
    <div className="flex items-center gap-1 rounded border border-divider bg-[#F0F0F0] p-1">
      {PROGRAM_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "cursor-pointer rounded px-4 py-2 font-body text-[16px] font-medium",
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

  const filteredTermini =
    program === "vsi" ? termini : termini.filter((termin) => termin.program === program);
  const filteredPastTermini =
    program === "vsi"
      ? pastTermini
      : pastTermini.filter((termin) => termin.program === program);

  return (
    <div className="mt-32 mb-32">
      <div className="flex items-center justify-between">
        <Heading2>Termini</Heading2>
        <div className="flex items-center gap-4">
          <ProgramToggle program={program} onChange={setProgram} />
          <Button
            type="button"
            variant="primary"
            icon={<Image src="/plus.svg" alt="" width={14} height={14} />}
          >
            Dodaj termin
          </Button>
        </div>
      </div>
      <AdminTerminiGrid termini={filteredTermini} pastTermini={filteredPastTermini} />
    </div>
  );
}
