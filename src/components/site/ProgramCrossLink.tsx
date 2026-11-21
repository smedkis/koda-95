"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

// A quiet pointer to the *other* program under the termini. Replaces the old
// Redno/Začetno toggle, which took up space above the cards: the owner once
// missed the nav links, so the other program still needs a way in here —
// just a low-key one that doesn't push the termini down.
export function ProgramCrossLink() {
  const pathname = usePathname();
  const t = useTranslations("ProgramCrossLink");
  const onZacetna = pathname.startsWith("/zacetno-usposabljanje");
  const href = onZacetna ? "/redno-usposabljanje" : "/zacetno-usposabljanje";

  return (
    <p className="text-center font-body text-[15px] text-paragraph">
      {onZacetna ? t("toRedna") : t("toZacetna")}{" "}
      <Link
        href={href}
        className="font-semibold whitespace-nowrap text-heading underline decoration-primary decoration-2 underline-offset-4 hover:text-primary"
      >
        {t("cta")} →
      </Link>
    </p>
  );
}
