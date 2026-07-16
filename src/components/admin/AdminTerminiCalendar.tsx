"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Heading2, Text, TextMedium } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";

type Program = "vsi" | "redna" | "zacetna";

export type CalendarTermin = {
  id: string;
  program: "redna" | "zacetna";
  title: string;
  dateISO: string;
  registeredCount: number;
  capacity?: number;
};

const PROGRAM_OPTIONS: { value: Program; label: string }[] = [
  { value: "vsi", label: "Vsi termini" },
  { value: "redna", label: "Redno" },
  { value: "zacetna", label: "Začetno" },
];

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

const WEEKDAY_LABELS = ["Pon", "Tor", "Sre", "Čet", "Pet", "Sob", "Ned"];

function ProgramToggle({
  program,
  onChange,
}: {
  program: Program;
  onChange: (program: Program) => void;
}) {
  return (
    <div className="flex h-11 items-center gap-1 overflow-x-auto rounded border border-divider bg-[#F0F0F0] p-1">
      {PROGRAM_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "flex h-full shrink-0 cursor-pointer items-center rounded px-4 font-body text-[16px] font-medium whitespace-nowrap",
            program === option.value ? "bg-white text-heading" : "text-placeholder",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function toIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Calendar grid always starts on a Monday and ends on a Sunday, however
// many weeks that takes for the given month — no padding to a fixed 6 rows.
function buildMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);

  const startOffset = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
  const start = new Date(year, month, 1 - startOffset);

  const endOffset = (7 - ((lastOfMonth.getDay() + 6) % 7) - 1) % 7;
  const end = new Date(year, month + 1, endOffset);

  const days: Date[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5 shrink-0">
      <path
        d={direction === "left" ? "M15 18L9 12L15 6" : "M9 18L15 12L9 6"}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DayChip({ termin }: { termin: CalendarTermin }) {
  const spots =
    termin.capacity !== undefined
      ? `${termin.registeredCount}/${termin.capacity} prijavljenih`
      : `${termin.registeredCount} prijavljenih`;
  return (
    <Link
      href={`/admin/termini/${termin.id}`}
      className={cn(
        "flex flex-col gap-0.5 rounded px-1.5 py-1 font-body text-[11px] font-medium transition-colors sm:text-[12px]",
        termin.program === "redna"
          ? "bg-primary text-white hover:bg-[#d06e1b]"
          : "bg-secondary text-paragraph hover:bg-[#5de0c0]",
      )}
    >
      <span className="line-clamp-2">{termin.title}</span>
      <span className="truncate opacity-80">{spots}</span>
    </Link>
  );
}

export function AdminTerminiCalendar({ termini }: { termini: CalendarTermin[] }) {
  const [program, setProgram] = useState<Program>("vsi");
  const today = useMemo(() => new Date(), []);
  const [viewedMonth, setViewedMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const filteredTermini = program === "vsi" ? termini : termini.filter((t) => t.program === program);

  const byDate = useMemo(() => {
    const map = new Map<string, CalendarTermin[]>();
    for (const termin of filteredTermini) {
      const list = map.get(termin.dateISO) ?? [];
      list.push(termin);
      map.set(termin.dateISO, list);
    }
    return map;
  }, [filteredTermini]);

  const year = viewedMonth.getFullYear();
  const month = viewedMonth.getMonth();
  const days = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const todayIso = toIso(today);

  const goToMonth = (delta: number) => setViewedMonth(new Date(year, month + delta, 1));

  return (
    <div className="mt-24 mb-24 lg:mt-32 lg:mb-32">
      <div className="flex items-center justify-between">
        <Heading2>Termini</Heading2>
        <Link
          href="/admin/termini/dodaj"
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded bg-primary px-[14px] py-[10px] font-body text-[16px] font-medium whitespace-nowrap text-white transition-colors hover:bg-[#d06e1b]"
        >
          <Image src="/plus.svg" alt="" width={14} height={14} className="size-4 shrink-0" />
          Dodaj termin
        </Link>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <ProgramToggle program={program} onChange={setProgram} />
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => goToMonth(-1)}
            aria-label="Prejšnji mesec"
            className="flex size-9 cursor-pointer items-center justify-center rounded bg-paragraph text-white transition-colors hover:bg-[#36272b]"
          >
            <ChevronIcon direction="left" />
          </button>
          <TextMedium className="min-w-[140px] text-center">
            {MONTH_NAMES[month]} {year}
          </TextMedium>
          <button
            type="button"
            onClick={() => goToMonth(1)}
            aria-label="Naslednji mesec"
            className="flex size-9 cursor-pointer items-center justify-center rounded bg-paragraph text-white transition-colors hover:bg-[#36272b]"
          >
            <ChevronIcon direction="right" />
          </button>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-divider bg-white">
        <div className="grid grid-cols-7 border-b border-divider bg-[#FAFAFA]">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="px-2 py-2 text-center">
              <Text className="text-[12px] font-medium text-placeholder sm:text-[14px]">{label}</Text>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dateIso = toIso(day);
            const isCurrentMonth = day.getMonth() === month;
            const isPast = dateIso < todayIso;
            const isToday = dateIso === todayIso;
            const dayTermini = byDate.get(dateIso) ?? [];

            return (
              <div
                key={dateIso}
                className={cn(
                  "group flex min-h-[104px] flex-col gap-1 border-r border-b border-divider p-1.5 last:border-r-0 sm:min-h-[140px] sm:p-2",
                  !isCurrentMonth && "bg-[#FAFAFA]",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full font-body text-[12px] font-medium sm:text-[14px]",
                      isToday
                        ? "bg-paragraph text-white"
                        : isCurrentMonth
                          ? "text-heading"
                          : "text-placeholder",
                    )}
                  >
                    {day.getDate()}
                  </span>
                  {!isPast && dayTermini.length < 2 ? (
                    <Link
                      href={`/admin/termini/dodaj?date=${dateIso}`}
                      aria-label={`Dodaj termin ${dateIso}`}
                      className="flex size-6 cursor-pointer items-center justify-center rounded text-placeholder opacity-0 transition-opacity hover:bg-secondary-bg hover:text-heading group-hover:opacity-100"
                    >
                      <Image src="/plus.svg" alt="" width={11} height={11} className="size-2.5" />
                    </Link>
                  ) : null}
                </div>
                <div className="flex flex-col gap-1">
                  {dayTermini.map((termin) => (
                    <DayChip key={termin.id} termin={termin} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
