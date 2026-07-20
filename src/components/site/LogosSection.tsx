import Image from "next/image";
import { useTranslations } from "next-intl";
import { Eyebrow } from "@/components/ui/Typography";

const LOGOS = [
  "/logo-partner-1.webp",
  "/logo-partner-2.webp",
  "/logo-partner-3.webp",
  "/logo-partner-4.webp",
  "/logo-partner-5.webp",
];

function LogoImage({ src }: { src: string }) {
  return (
    <div className="flex items-center justify-center">
      <Image src={src} alt="" width={125} height={50} className="h-12 w-auto shrink-0" />
    </div>
  );
}

export function LogosSection() {
  const t = useTranslations("LogosSection");

  return (
    <div className="mt-24 mb-32 flex flex-col items-center gap-8">
      <Eyebrow className="text-center">{t("trust")}</Eyebrow>
      {/* flex-wrap centers every row (including a trailing partial one),
          unlike a grid, which left-aligns it — simplest way to handle a
          count that doesn't divide evenly across breakpoints. */}
      <div className="flex w-full flex-wrap items-center justify-center gap-x-16 gap-y-6">
        {LOGOS.map((src) => (
          <LogoImage key={src} src={src} />
        ))}
      </div>
    </div>
  );
}
