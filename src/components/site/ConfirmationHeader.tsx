import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heading2, Text } from "@/components/ui/Typography";

export function ConfirmationHeader() {
  const t = useTranslations("Confirmation");
  return (
    <div className="mx-auto mt-24 lg:mt-32 max-w-[680px] text-left print:mt-12">
      <div className="flex items-center justify-start gap-4">
        <Image src="/kljukica.svg" alt="" width={40} height={40} className="shrink-0" />
        <Heading2>{t("title")}</Heading2>
      </div>
      <Text className="mt-2">{t("subtitle")}</Text>
    </div>
  );
}
