"use client";

import { useTranslations } from "next-intl";
import { TextMedium } from "@/components/ui/Typography";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

export function NavLinks() {
  const pathname = usePathname();
  const t = useTranslations("Nav");
  const LINKS = [
    { href: "/redno-usposabljanje", label: t("redna"), accent: "bg-primary" },
    { href: "/zacetno-usposabljanje", label: t("zacetna"), accent: "bg-secondary" },
  ] as const;

  // Hide on the registration form and confirmation page — don't invite
  // navigating away mid-registration or right after a successful sign-up.
  if (pathname.endsWith("/potrjeno") || pathname.endsWith("/obrazec")) {
    return null;
  }

  return (
    <div className="hidden items-center gap-8 sm:flex">
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href} className="relative inline-block">
          <TextMedium as="span">{link.label}</TextMedium>
          {/* Grows left-to-right via scaleX from a fixed-origin left edge,
              instead of text-decoration underline, so it can animate. */}
          <span
            className={cn(
              "absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 transition-transform duration-300 ease-out",
              link.accent,
              pathname === link.href && "scale-x-100",
            )}
          />
        </Link>
      ))}
    </div>
  );
}
