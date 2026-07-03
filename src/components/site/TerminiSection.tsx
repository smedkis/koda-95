import { useTranslations } from "next-intl";
import { Eyebrow } from "@/components/ui/Typography";
import { TerminCard, type TerminCardProps } from "./TerminCard";

export function TerminiSection({ termini }: { termini: TerminCardProps[] }) {
  const t = useTranslations("TerminiSection");
  return (
    <div id="termini" className="mt-16 flex flex-col items-center gap-8">
      <Eyebrow>{t("heading")}</Eyebrow>
      <div className="grid w-full grid-cols-2 gap-8">
        {termini.map((termin) => (
          <TerminCard key={termin.href} {...termin} />
        ))}
      </div>
    </div>
  );
}
