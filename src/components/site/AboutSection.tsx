import Image from "next/image";
import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";
import { Heading2, Text, TextBig } from "@/components/ui/Typography";

export function AboutSection() {
  const t = useTranslations("About");
  return (
    <div className="mt-24 lg:mt-32 flex flex-col items-center">
      <div className="flex max-w-[680px] flex-col items-center text-center">
        <div className="flex items-center gap-2">
          <Image src="/google.svg" alt="Google" width={40} height={40} />
          <Image src="/stars.svg" alt="" width={101} height={17} />
          <Text className="font-semibold">{t("rating")}</Text>
        </div>
        <Heading2 className="mt-4">{t("heading")}</Heading2>
        <TextBig className="mt-4">{t("body")}</TextBig>
        <ButtonLink href="#termini" variant="primary" className="mt-8">
          {t("cta")}
        </ButtonLink>
      </div>
      <Image
        src="/about.webp"
        alt=""
        width={2000}
        height={900}
        className="mt-16 w-full"
      />
    </div>
  );
}
