"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { DIAL_CODE_OPTIONS, type DialCodeOption } from "@/lib/dial-codes";
import { Eyebrow } from "./Typography";

const DEFAULT_DIAL_CODE = DIAL_CODE_OPTIONS[0].code;

// The full number (dial code + rest) is still stored/passed as a single
// plain string, same shape the phone field always had — this only changes
// how it's typed in, not the data model, so every existing call site keeps
// working by just swapping <Input type="tel" .../> for <PhoneInput .../>.
// Country calling codes are prefix-free by design (ITU E.164), so matching
// on a leading substring is unambiguous.
function splitPhone(value: string): { dialCode: string; number: string } {
  const match = DIAL_CODE_OPTIONS.find(
    (entry) => value === entry.code || value.startsWith(`${entry.code} `),
  );
  if (match) return { dialCode: match.code, number: value.slice(match.code.length).trim() };
  return { dialCode: DEFAULT_DIAL_CODE, number: value };
}

function flagUrl(iso: string): string {
  return `https://flagcdn.com/${iso}.svg`;
}

function DialCodeSelect({
  value,
  onChange,
  buttonClassName,
}: {
  value: string;
  onChange: (code: string) => void;
  buttonClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = DIAL_CODE_OPTIONS.find((entry) => entry.code === value) ?? DIAL_CODE_OPTIONS[0];

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DIAL_CODE_OPTIONS;
    return DIAL_CODE_OPTIONS.filter(
      (entry) => entry.name.toLowerCase().includes(q) || entry.code.includes(q),
    );
  }, [query]);

  const handleSelect = (entry: DialCodeOption) => {
    onChange(entry.code);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "flex h-full w-[104px] items-center gap-1.5 rounded border border-divider bg-white px-2 font-body text-[16px] text-paragraph focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
          buttonClassName,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- external flag CDN, not a local optimizable asset */}
        <img
          src={flagUrl(selected.iso)}
          alt=""
          width={20}
          height={15}
          className="shrink-0 rounded-[2px]"
        />
        <span className="truncate">{selected.code}</span>
      </button>
      {isOpen ? (
        <div className="absolute z-20 mt-1 w-[260px] rounded border border-divider bg-white shadow-lg">
          <input
            autoFocus
            type="text"
            placeholder="Išči državo …"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full border-b border-divider px-3 py-2 font-body text-[14px] text-paragraph placeholder-placeholder focus:outline-none"
          />
          <ul className="max-h-60 overflow-y-auto">
            {filtered.map((entry) => (
              <li
                key={entry.iso}
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelect(entry);
                }}
                className={cn(
                  "flex cursor-pointer items-center gap-2 px-3 py-2 font-body text-[14px]",
                  entry.code === value ? "bg-secondary-bg text-heading" : "text-paragraph",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- external flag CDN, not a local optimizable asset */}
                <img
                  src={flagUrl(entry.iso)}
                  alt=""
                  width={20}
                  height={15}
                  className="shrink-0 rounded-[2px]"
                />
                <span className="w-12 shrink-0 text-placeholder">{entry.code}</span>
                <span className="truncate">{entry.name}</span>
              </li>
            ))}
            {filtered.length === 0 ? (
              <li className="px-3 py-2 font-body text-[14px] text-placeholder">Ni najdenih držav.</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function PhoneInput({
  label,
  required,
  value,
  onChange,
  inputClassName,
  name,
}: {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  inputClassName?: string;
  name?: string;
}) {
  const { dialCode, number } = splitPhone(value);

  return (
    <div>
      {label ? (
        <Eyebrow className="mb-2 block">
          {label}
          {required ? " *" : ""}
        </Eyebrow>
      ) : null}
      <div className="flex gap-2">
        <DialCodeSelect
          value={dialCode}
          onChange={(code) => onChange(`${code} ${number}`.trim())}
          buttonClassName={inputClassName}
        />
        <input
          type="tel"
          name={name}
          value={number}
          onChange={(event) => onChange(`${dialCode} ${event.target.value}`.trim())}
          className={cn(
            "w-full rounded border border-divider bg-white px-[14px] py-[10px] font-body text-[16px] text-paragraph placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
            inputClassName,
          )}
        />
      </div>
    </div>
  );
}
