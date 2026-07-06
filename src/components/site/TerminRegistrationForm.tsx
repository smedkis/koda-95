import { useTranslations } from "next-intl";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Typography";

export function TerminRegistrationForm({ daysUntil }: { daysUntil?: number }) {
  const t = useTranslations("TerminRegistrationForm");
  const isNext = daysUntil !== undefined;
  return (
    <Box
      className={
        isNext
          ? "relative flex flex-col border-2 border-transparent pb-6 shadow-[0_16px_36px_-20px_rgba(245,130,32,0.45)]"
          : "flex flex-col pb-6"
      }
      style={
        isNext
          ? {
              backgroundImage:
                "linear-gradient(#fff, #FFF6EC), linear-gradient(90deg, #f58220, #ffab5c)",
              backgroundOrigin: "border-box",
              backgroundClip: "padding-box, border-box",
            }
          : undefined
      }
    >
      {isNext ? (
        <span className="absolute left-6 top-0 inline-flex w-fit -translate-y-1/2 items-center rounded-full bg-gradient-to-r from-primary to-[#ffab5c] px-3 py-1.5 font-body text-[12px] font-semibold text-white shadow-[0_4px_12px_-3px_rgba(245,130,32,0.5)]">
          Termin je čez {daysUntil} {daysUntil === 1 ? "dan" : "dni"}. Rezervirajte svoje mesto
          pravočasno.
        </span>
      ) : null}
      <Input label={t("fullName")} placeholder={t("fullName")} name="fullName" required />
      <Input
        label={t("email")}
        placeholder={t("email")}
        name="email"
        type="email"
        required
        className="mt-6"
      />
      <Input
        label={t("phone")}
        placeholder={t("phone")}
        name="phone"
        type="tel"
        required
        className="mt-6"
      />
      <Checkbox
        name="consentMarketing"
        label={t("consentMarketing")}
        className="mt-6"
      />
      <Checkbox
        name="consentTerms"
        required
        label={t("consentTerms")}
        className="mt-4"
      />
      <Button variant="secondary" className="mt-8 w-full">
        {t("submit")}
      </Button>
      <Text className="mt-2 text-center text-[14px] font-medium text-[#006e5e]">
        Prijavi se zdaj, plačaj kasneje
      </Text>
    </Box>
  );
}
