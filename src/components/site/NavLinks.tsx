"use client";

import { useTranslations } from "next-intl";
import { TextMedium } from "@/components/ui/Typography";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

export function NavLinks() {
  const pathname = usePathname();
  const t = useTranslations("Nav");
  const LINKS = [
    { href: "/redno-usposabljanje", label: t("redna"), accent: "decoration-primary" },
    { href: "/zacetno-usposabljanje", label: t("zacetna"), accent: "decoration-secondary" },
  ] as const;

  // Hide on the registration form and confirmation page — don't invite
  // navigating away mid-registration or right after a successful sign-up.
  if (pathname.endsWith("/potrjeno") || pathname.endsWith("/obrazec")) {
    return null;
  }

  return (
    <div className="hidden items-center gap-8 sm:flex">
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href}>
          <TextMedium
            as="span"
            className={cn(
              pathname === link.href && `underline ${link.accent} decoration-2 underline-offset-4`,
            )}
          >
            {link.label}
          </TextMedium>
        </Link>
      ))}
    </div>
  );
}
