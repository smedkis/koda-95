import Image from "next/image";
import { useTranslations } from "next-intl";
import { Eyebrow } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";

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

// The width constraint (for the tablet row split) goes on this wrapper, not
// the <Image> itself — each logo has a different aspect ratio, so forcing a
// fixed width directly on the image while its height stays pinned at h-12
// stretches it. The image always stays h-12 w-auto and just gets centered
// within whatever width the wrapper is given.
function LogoImage({ src, containerClassName }: { src: string; containerClassName?: string }) {
  return (
    <div className={cn("flex items-center justify-center", containerClassName)}>
      <Image src={src} alt="" width={125} height={50} className="h-12 w-auto shrink-0" />
    </div>
  );
}

export function LogosSection() {
  const t = useTranslations("LogosSection");
  // 7 logos don't divide evenly, so each breakpoint gets its own row split
  // that leaves no row half-empty and left-aligned:
  // - mobile: 3 columns, only the first 6 shown (3+3)
  // - tablet: 4 then 3, as two explicit centered rows (a grid's trailing
  //   row of 3 in a 4-column grid would otherwise stick to the left)
  // - desktop: all 7 in a single centered row
  const tabletFirstRow = LOGOS.slice(0, 4);
  const tabletSecondRow = LOGOS.slice(4);
  const tabletItemWidth = "w-[calc((100%-6rem)/4)]";

  return (
    <div className="mt-24 mb-32 flex flex-col items-center gap-8">
      <Eyebrow className="text-center">{t("trust")}</Eyebrow>

      {/* Mobile */}
      <div className="grid w-full grid-cols-3 items-center gap-x-8 gap-y-6 sm:hidden">
        {LOGOS.slice(0, 6).map((src, index) => (
          <LogoImage key={`${src}-${index}`} src={src} />
        ))}
      </div>

      {/* Tablet */}
      <div className="hidden w-full flex-col items-center gap-y-6 sm:flex lg:hidden">
        <div className="flex w-full justify-center gap-x-8">
          {tabletFirstRow.map((src, index) => (
            <LogoImage key={`${src}-${index}`} src={src} containerClassName={tabletItemWidth} />
          ))}
        </div>
        <div className="flex w-full justify-center gap-x-8">
          {tabletSecondRow.map((src, index) => (
            <LogoImage key={`${src}-${index}`} src={src} containerClassName={tabletItemWidth} />
          ))}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden w-full items-center justify-center gap-x-8 lg:flex">
        {LOGOS.map((src, index) => (
          <LogoImage key={`${src}-${index}`} src={src} />
        ))}
      </div>
    </div>
  );
}
