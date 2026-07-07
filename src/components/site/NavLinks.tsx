"use client";

import { useTranslations } from "next-intl";
import { TextMedium } from "@/components/ui/Typography";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

export function NavLinks() {
  const pathname = usePathname();
  const t = useTranslations("Nav");
  const LINKS = [
    { href: "/redna-koda-95", label: t("redna") },
    { href: "/zacetna-koda-95", label: t("zacetna") },
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
          <TextMedium as="span" className={cn(pathname === link.href && "text-primary")}>
            {link.label}
          </TextMedium>
        </Link>
      ))}
    </div>
  );
}
