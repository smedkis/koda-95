import { useTranslations } from "next-intl";
import { Eyebrow } from "@/components/ui/Typography";

export function ObrazecStepHeader({
  sectionTitle,
  step,
  totalSteps = 3,
}: {
  sectionTitle: string;
  step: number;
  totalSteps?: number;
}) {
  const t = useTranslations("Obrazec");
  return (
    <div className="mx-auto mt-16 flex max-w-[680px] items-center justify-between gap-4">
      <Eyebrow>{sectionTitle}</Eyebrow>
      <Eyebrow className="shrink-0 whitespace-nowrap">
        {t.rich("stepLabel", {
          highlight: (chunks) => <span className="text-primary">{chunks}</span>,
          step,
          totalSteps,
        })}
      </Eyebrow>
    </div>
  );
}
