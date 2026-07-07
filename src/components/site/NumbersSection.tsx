import { useTranslations } from "next-intl";
import { Eyebrow, Heading1, TextMedium } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";

function NumberItem({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-2 text-center", className)}>
      <Heading1
        as="span"
        className="text-[22px] leading-[28px] text-[#006b5e] sm:text-[32px] sm:leading-[40px] lg:text-[48px] lg:leading-[58px]"
      >
        {value}
      </Heading1>
      <TextMedium>{label}</TextMedium>
    </div>
  );
}

export function NumbersSection() {
  const t = useTranslations("Numbers");
  const NUMBERS = [
    { value: "37+", label: t("years") },
    { value: "3.000+", label: t("customers") },
    { value: "11", label: t("staff") },
    { value: "10.000+", label: t("services") },
    { value: "100+", label: t("technicians") },
  ];
  // 5 items don't split evenly into 3 columns — on mobile/tablet the row of
  // 3 and the trailing row of 2 are laid out as separate centered flex rows
  // (a plain grid would leave the last row of 2 stuck to the left) instead
  // of the plain 5-column grid used from `lg` up.
  const firstRow = NUMBERS.slice(0, 3);
  const secondRow = NUMBERS.slice(3);
  const mobileItemWidth = "w-[calc((100%-2rem)/3)]";

  return (
    <div className="mt-24 flex flex-col items-center">
      <Eyebrow>{t("heading")}</Eyebrow>
      <div className="mt-16 flex w-full flex-col items-center gap-y-8 lg:hidden">
        <div className="flex w-full justify-center gap-x-4">
          {firstRow.map((item) => (
            <NumberItem key={item.label} {...item} className={mobileItemWidth} />
          ))}
        </div>
        <div className="flex w-full justify-center gap-x-4">
          {secondRow.map((item) => (
            <NumberItem key={item.label} {...item} className={mobileItemWidth} />
          ))}
        </div>
      </div>
      <div className="mt-16 hidden w-full lg:grid lg:grid-cols-5 lg:gap-8">
        {NUMBERS.map((item) => (
          <NumberItem key={item.label} {...item} />
        ))}
      </div>
    </div>
  );
}
