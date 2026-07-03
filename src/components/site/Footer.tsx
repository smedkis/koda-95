import { useTranslations } from "next-intl";
import { Text, TextMedium } from "@/components/ui/Typography";

export function Footer() {
  const t = useTranslations("Footer");
  return (
    <div className="flex items-center justify-between py-6">
      <Text>{t("copyright")}</Text>
      <div className="flex items-center gap-4">
        <a
          href="https://www.tahograficuderman.si/pogoji-poslovanja-in-politika-zasebnosti"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          <TextMedium>{t("terms")}</TextMedium>
        </a>
        <a
          href="https://gregacuderman.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          <TextMedium>{t("credit")}</TextMedium>
        </a>
      </div>
    </div>
  );
}
