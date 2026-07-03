"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { Box } from "@/components/ui/Box";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/cn";

const LABELS: Record<string, string> = {
  sl: "SL",
  en: "EN",
  sr: "SR",
};

const LONG_LABELS: Record<string, string> = {
  sl: "Slovenščina",
  en: "English",
  sr: "Srpsko-hrvatski",
};

function LocaleBadge({ code, selected }: { code: string; selected?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold text-white",
        selected ? "bg-primary" : "bg-black",
      )}
    >
      {code}
    </span>
  );
}

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="relative print:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex cursor-pointer items-center gap-1 font-body text-[16px] font-medium text-paragraph"
      >
        {LABELS[locale]}
        <svg
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className={cn("size-4 transition-transform", open && "rotate-180")}
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open ? (
        <Box className="absolute right-0 top-full z-50 mt-2 w-max p-1" as="ul">
          {routing.locales.map((loc) => (
            <li key={loc}>
              <button
                type="button"
                onClick={() => {
                  router.replace(pathname, { locale: loc });
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 whitespace-nowrap rounded px-3 py-1.5 text-left font-body text-[16px] text-paragraph",
                  loc === locale && "text-heading font-semibold",
                )}
              >
                <LocaleBadge code={LABELS[loc]} selected={loc === locale} />
                {LONG_LABELS[loc]}
              </button>
            </li>
          ))}
        </Box>
      ) : null}
    </div>
  );
}
