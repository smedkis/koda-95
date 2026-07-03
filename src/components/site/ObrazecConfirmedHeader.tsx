import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heading2, Text } from "@/components/ui/Typography";

export function ObrazecConfirmedHeader() {
  const t = useTranslations("Obrazec");
  return (
    <div className="mx-auto mt-32 max-w-[680px] text-center">
      <div className="flex items-center justify-center gap-4">
        <Image src="/kljukica.svg" alt="" width={40} height={40} className="shrink-0" />
        <Heading2>{t("confirmedTitle")}</Heading2>
      </div>
      <Text className="mt-2">{t("confirmedDescription")}</Text>
    </div>
  );
}
