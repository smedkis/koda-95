import { useTranslations } from "next-intl";
import { Heading2, Text } from "@/components/ui/Typography";

export function ObrazecHeader() {
  const t = useTranslations("Obrazec");
  return (
    <div className="mx-auto mt-32 max-w-[680px]">
      <Heading2>{t("headerTitle")}</Heading2>
      <Text className="mt-4">{t("headerDescription")}</Text>
    </div>
  );
}
