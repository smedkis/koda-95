import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Typography";

export function ConfirmationSummary() {
  const t = useTranslations("Confirmation");
  return (
    <div className="mx-auto mt-16 max-w-[680px]">
      <div className="flex items-center justify-between">
        <Eyebrow>{t("summaryHeading")}</Eyebrow>
        <div className="flex items-center gap-4">
          <Button
            variant="action"
            icon={<Image src="/icon-calendar-white.svg" alt="" width={16} height={16} />}
          >
            {t("addToCalendar")}
          </Button>
          <Button
            variant="action"
            icon={<Image src="/icon-print.svg" alt="" width={16} height={16} />}
          >
            {t("print")}
          </Button>
        </div>
      </div>
    </div>
  );
}
