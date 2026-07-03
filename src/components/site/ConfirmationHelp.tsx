import { useTranslations } from "next-intl";
import { Eyebrow, TextMedium } from "@/components/ui/Typography";

export function ConfirmationHelp() {
  const t = useTranslations("ConfirmationHelp");
  return (
    <div className="mx-auto mt-16 max-w-[680px] text-center print:mt-6">
      <Eyebrow>{t("heading")}</Eyebrow>
      <a href="mailto:koda95@tahograficuderman.si" className="mt-4 block hover:underline">
        <TextMedium>koda95@tahograficuderman.si</TextMedium>
      </a>
    </div>
  );
}
