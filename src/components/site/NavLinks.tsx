"use client";

import { TextMedium } from "@/components/ui/Typography";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/redna-koda-95", label: "Redna Koda 95" },
  { href: "/zacetna-koda-95", label: "Začetna Koda 95" },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  // Hide on the registration confirmation page — don't invite navigating
  // away right after a successful sign-up.
  if (pathname.endsWith("/potrjeno")) {
    return null;
  }

  return (
    <div className="flex items-center gap-8">
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
