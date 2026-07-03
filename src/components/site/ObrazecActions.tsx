import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

export function ObrazecActions({
  showBack = false,
  nextDisabled = false,
  onNext,
  onBack,
}: {
  showBack?: boolean;
  nextDisabled?: boolean;
  onNext: () => void;
  onBack?: () => void;
}) {
  const t = useTranslations("Obrazec");
  return (
    <div className="mx-auto mt-8 flex max-w-[680px] items-center justify-between">
      {showBack ? (
        <Button type="button" variant="secondary" onClick={onBack}>
          {t("back")}
        </Button>
      ) : (
        <span />
      )}
      <Button type="button" variant="primary" disabled={nextDisabled} onClick={onNext}>
        {t("next")}
      </Button>
    </div>
  );
}
