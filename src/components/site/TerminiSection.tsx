import { useTranslations } from "next-intl";
import { Eyebrow, Text } from "@/components/ui/Typography";
import { Box } from "@/components/ui/Box";
import { cn } from "@/lib/cn";
import { ProgramSwitch } from "./ProgramSwitch";
import { TerminCard, type TerminCardProps } from "./TerminCard";

export type TerminEntry = Omit<TerminCardProps, "daysUntil">;

function getDaysUntil(dateISO: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateISO}T00:00:00`);
  return Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

export function TerminiSection({
  termini,
  vir,
}: {
  termini: TerminEntry[];
  vir?: string;
}) {
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

  if (sortedTermini.length === 0) {
    return (
      <div
        id="termini"
        className="mt-10 flex scroll-mt-6 flex-col items-center gap-8"
      >
        <ProgramSwitch />
        <Box className="mx-auto flex max-w-[680px] flex-col items-center gap-4 border-notice-border bg-notice-bg text-center">
          <Eyebrow as="h2">{t("emptyHeading")}</Eyebrow>
          <Text>
            {t.rich("emptyBody", {
              email: (chunks) => (
                <a
                  href="mailto:koda95@tahograficuderman.si"
                  className="underline hover:no-underline"
                >
                  {chunks}
                </a>
              ),
            })}
          </Text>
        </Box>
      </div>
    );
  }

  const nextHref = sortedTermini.find(
    (termin) => getDaysUntil(termin.dateISO) >= 0,
  )?.href;
  const isSingle = sortedTermini.length === 1;

  return (
    <div
      id="termini"
      className="mt-10 flex scroll-mt-6 flex-col items-center gap-8"
    >
      {/* The program tabs sit right above the cards (they switch which
          termini you see), so they double as this section's visible header.
          The h2 stays for screen readers and search engines. */}
      <h2 className="sr-only">{t("heading")}</h2>
      <ProgramSwitch />
      <div
        className={
          isSingle
            ? "flex w-full justify-center"
            : "grid w-full grid-cols-1 gap-8 lg:grid-cols-2"
        }
      >
        {sortedTermini.map((cardProps, index) => (
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
              href={vir ? `${cardProps.href}?vir=${vir}` : cardProps.href}
              daysUntil={
                cardProps.href === nextHref
                  ? getDaysUntil(cardProps.dateISO)
                  : undefined
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
