"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Eyebrow } from "./Typography";

// A dropdown that still only accepts one of `options` (like <select>), but
// lets typing filter the list down instead of scrolling/relying on the
// browser's own "jump to first match" behavior — built for long lists like
// the country selects, where owner feedback was "keep it a dropdown, but
// let me type to find things faster."
export function Combobox({
  label,
  placeholder,
  required,
  value,
  onChange,
  options,
  name,
  className,
  inputClassName,
}: {
  label?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  name?: string;
  className?: string;
  inputClassName?: string;
}) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep the visible text in sync when the committed value changes from
  // outside (e.g. a parent resetting the form) — adjusting state during
  // render (React's recommended pattern for this) instead of an effect,
  // which would cause an extra render pass.
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setQuery(value);
  }

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery(value);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q === value.toLowerCase()) return options;
    return options.filter((option) => option.toLowerCase().includes(q));
  }, [query, options, value]);

  const handleSelect = (option: string) => {
    onChange(option);
    setQuery(option);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((current) => Math.min(current + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (filtered[highlightedIndex]) handleSelect(filtered[highlightedIndex]);
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setQuery(value);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative block", className)}>
      {label ? (
        <Eyebrow className="mb-2 block">
          {label}
          {required ? " *" : ""}
        </Eyebrow>
      ) : null}
      <div className="relative">
        <input
          type="text"
          name={name}
          autoComplete="off"
          required={required}
          placeholder={placeholder}
          value={query}
          onFocus={() => {
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full rounded border border-divider bg-white px-[14px] py-[10px] pr-10 font-body text-[16px] text-paragraph placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
            inputClassName,
          )}
        />
        <Image
          src="/down.svg"
          alt=""
          width={16}
          height={16}
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 opacity-50"
        />
      </div>
      {isOpen && filtered.length > 0 ? (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded border border-divider bg-white shadow-lg">
          {filtered.map((option, index) => (
            <li
              key={option}
              onMouseDown={(event) => {
                event.preventDefault();
                handleSelect(option);
              }}
              className={cn(
                "cursor-pointer px-[14px] py-2 font-body text-[15px]",
                index === highlightedIndex ? "bg-secondary-bg text-heading" : "text-paragraph",
              )}
            >
              {option}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
