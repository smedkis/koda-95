"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

// Sits next to the language switcher on mobile instead of NavLinks' plain
// text links (which don't fit two-up next to the logo + switcher) — a
// segmented toggle instead of a hamburger so which program is active stays
// visible at all times and switching is one tap.
export function MobileProgramToggle() {
  const pathname = usePathname();
  const t = useTranslations("Nav");
  const LINKS = [
    { href: "/redna-koda-95", label: t("rednaShort") },
    { href: "/zacetna-koda-95", label: t("zacetnaShort") },
  ] as const;

  // Only on the two plain landing pages — not termin detail/obrazec/potrjeno
  // sub-routes, where switching programs mid-flow isn't useful.
  if (pathname !== "/redna-koda-95" && pathname !== "/zacetna-koda-95") {
    return null;
  }

  return (
    <div className="flex items-center gap-1 rounded border border-divider bg-[#F0F0F0] p-1 sm:hidden">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "rounded px-2.5 py-1.5 font-body text-[13px] font-medium whitespace-nowrap",
            pathname === link.href ? "bg-white text-heading" : "text-placeholder",
          )}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
