import Image from "next/image";
import { useTranslations } from "next-intl";
import { Eyebrow } from "@/components/ui/Typography";

// Duplicated placeholders to reach 7 — real additional logos to follow.
const LOGOS = [
  "/logo-partner-1.webp",
  "/logo-partner-2.webp",
  "/logo-partner-3.webp",
  "/logo-partner-4.webp",
  "/logo-partner-5.webp",
  "/logo-partner-1.webp",
  "/logo-partner-2.webp",
];

export function LogosSection() {
  const t = useTranslations("LogosSection");
  return (
    <div className="mt-24 mb-32 flex flex-col items-center gap-8">
      <Eyebrow>{t("trust")}</Eyebrow>
      <div className="flex w-full flex-wrap items-center justify-between gap-x-8 gap-y-4">
        {LOGOS.map((src, index) => (
          <Image
            key={`${src}-${index}`}
            src={src}
            alt=""
            width={125}
            height={50}
            className="h-12 w-auto"
          />
        ))}
      </div>
    </div>
  );
}
