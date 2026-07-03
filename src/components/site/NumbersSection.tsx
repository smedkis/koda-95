import { useTranslations } from "next-intl";
import { Eyebrow, Heading1, TextMedium } from "@/components/ui/Typography";

export function NumbersSection() {
  const t = useTranslations("Numbers");
  const NUMBERS = [
    { value: "37+", label: t("years") },
    { value: "3.000+", label: t("customers") },
    { value: "11", label: t("staff") },
    { value: "10.000+", label: t("services") },
    { value: "100+", label: t("technicians") },
  ];
  return (
    <div className="mt-24 flex flex-col items-center">
      <Eyebrow>{t("heading")}</Eyebrow>
      <div className="mt-16 grid w-full grid-cols-5 gap-8">
        {NUMBERS.map((item) => (
          <div key={item.label} className="flex flex-col items-start gap-2 text-left">
            <Heading1 as="span" className="text-secondary-dark">
              {item.value}
            </Heading1>
            <TextMedium>{item.label}</TextMedium>
          </div>
        ))}
      </div>
    </div>
  );
}
