import { useTranslations } from "next-intl";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";

export function TerminRegistrationForm() {
  const t = useTranslations("TerminRegistrationForm");
  return (
    <Box className="flex flex-col">
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
    </Box>
  );
}
