import { useTranslations } from "next-intl";
import { Eyebrow } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { TerminCard, type TerminCardProps } from "./TerminCard";

export type TerminEntry = Omit<TerminCardProps, "daysUntil"> & { dateISO: string };

function getDaysUntil(dateISO: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateISO}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function TerminiSection({ termini }: { termini: TerminEntry[] }) {
  const t = useTranslations("TerminiSection");

  // Cards are always shown with the soonest upcoming termin on top, followed
  // by the rest in chronological order — not just array order, since
  // placeholder/admin-entered data isn't guaranteed sorted. Any past-dated
  // entries sink to the bottom instead of jumping ahead of the next termin.
  const sortedTermini = [...termini].sort((a, b) => {
    const daysA = getDaysUntil(a.dateISO);
    const daysB = getDaysUntil(b.dateISO);
    if (daysA >= 0 && daysB < 0) return -1;
    if (daysA < 0 && daysB >= 0) return 1;
    return daysA - daysB;
  });

  const nextHref = sortedTermini.find((termin) => getDaysUntil(termin.dateISO) >= 0)?.href;
  const isSingle = sortedTermini.length === 1;

  return (
    <div id="termini" className="mt-16 flex flex-col items-center gap-8">
      <Eyebrow>{t("heading")}</Eyebrow>
      <div
        className={
          isSingle
            ? "flex w-full justify-center"
            : "grid w-full grid-cols-1 gap-8 lg:grid-cols-2"
        }
      >
        {sortedTermini.map(({ dateISO, ...cardProps }, index) => (
          <div
            key={cardProps.href}
            className={cn(
              "animate-card-in",
              isSingle ? "w-full lg:max-w-[calc(50%-1rem)]" : undefined,
            )}
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <TerminCard
              {...cardProps}
              daysUntil={cardProps.href === nextHref ? getDaysUntil(dateISO) : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
