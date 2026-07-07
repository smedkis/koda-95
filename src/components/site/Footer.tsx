import { useTranslations } from "next-intl";
import { Text, TextMedium } from "@/components/ui/Typography";

export function Footer() {
  const t = useTranslations("Footer");
  return (
    <div className="flex flex-col items-start gap-3 py-6 sm:flex-row sm:items-center sm:justify-between print:items-center print:justify-center">
      <Text>{t("copyright")}</Text>
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
        <a
          href="https://www.tahograficuderman.si/pogoji-poslovanja-in-politika-zasebnosti"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline print:hidden"
        >
          <TextMedium>{t("terms")}</TextMedium>
        </a>
        <a
          href="https://gregacuderman.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline print:hidden"
        >
          <TextMedium>{t("credit")}</TextMedium>
        </a>
      </div>
    </div>
  );
}
