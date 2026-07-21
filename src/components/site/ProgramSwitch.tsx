"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

// Lets someone on the Redno page discover Začetno (and vice versa) without
// having to notice the nav links — the owner reported not finding this
// himself, so it's repeated here front-and-center under the hero.
export function ProgramSwitch() {
  const pathname = usePathname();
  const t = useTranslations("Nav");
  const links = [
    { href: "/redno-usposabljanje", label: t("redna"), shortLabel: t("rednaShort") },
    { href: "/zacetno-usposabljanje", label: t("zacetna"), shortLabel: t("zacetnaShort") },
  ] as const;

  return (
    <div className="flex h-11 items-center gap-1 rounded border border-divider bg-[#F0F0F0] p-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "flex h-full items-center justify-center rounded px-4 font-body text-[16px] font-medium whitespace-nowrap transition-colors",
            pathname === link.href
              ? "bg-white text-heading"
              : "text-placeholder hover:text-paragraph",
          )}
        >
          <span className="sm:hidden">{link.shortLabel}</span>
          <span className="hidden sm:inline">{link.label}</span>
        </Link>
      ))}
    </div>
  );
}
