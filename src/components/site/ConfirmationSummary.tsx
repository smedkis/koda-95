"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Typography";
import { buildIcsFile, downloadIcsFile } from "@/lib/ics";

export function ConfirmationSummary({
  title,
  date,
  timeRange,
  location,
}: {
  title: string;
  date: string;
  timeRange: string;
  location: string;
}) {
  const t = useTranslations("Confirmation");

  const handleAddToCalendar = () => {
    const ics = buildIcsFile({ title, location, date, timeRange });
    downloadIcsFile("koda-95.ics", ics);
  };

  return (
    <div className="mx-auto mt-16 max-w-[680px] print:mt-4">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Eyebrow>{t("summaryHeading")}</Eyebrow>
        <div className="flex items-center gap-4 print:hidden">
          <Button
            type="button"
            variant="action"
            onClick={handleAddToCalendar}
            className="whitespace-nowrap"
            icon={<Image src="/icon-calendar-white.svg" alt="" width={16} height={16} />}
          >
            {t("addToCalendar")}
          </Button>
          <Button
            type="button"
            variant="action"
            onClick={() => window.print()}
            className="whitespace-nowrap"
            icon={<Image src="/icon-print.svg" alt="" width={16} height={16} />}
          >
            {t("print")}
          </Button>
        </div>
      </div>
    </div>
  );
}
