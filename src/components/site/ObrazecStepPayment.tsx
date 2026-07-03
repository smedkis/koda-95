import { useTranslations } from "next-intl";
import { Box } from "@/components/ui/Box";
import { Input } from "@/components/ui/Input";
import { Radio } from "@/components/ui/Radio";
import type { ObrazecFormData } from "@/lib/obrazec-form";

export function ObrazecStepPayment({
  value,
  onChange,
}: {
  value: ObrazecFormData;
  onChange: (patch: Partial<ObrazecFormData>) => void;
}) {
  const t = useTranslations("Obrazec");
  return (
    <Box className="flex flex-col gap-6">
      <div className="flex items-center gap-8">
        <Radio
          name="payerType"
          value="self"
          label={t("paySelf")}
          checked={value.payerType === "self"}
          onChange={() => onChange({ payerType: "self" })}
        />
        <Radio
          name="payerType"
          value="company"
          label={t("payCompany")}
          checked={value.payerType === "company"}
          onChange={() => onChange({ payerType: "company" })}
        />
      </div>

      {value.payerType === "company" ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t("companyName")}
              placeholder={t("companyName")}
              name="companyName"
              required
              value={value.companyName}
              onChange={(e) => onChange({ companyName: e.target.value })}
            />
            <Input
              label={t("companyTaxNumber")}
              placeholder={t("companyTaxNumber")}
              name="companyTaxNumber"
              value={value.companyTaxNumber}
              onChange={(e) => onChange({ companyTaxNumber: e.target.value })}
            />
          </div>
          <Input
            label={t("companyEmail")}
            placeholder={t("companyEmail")}
            name="companyEmail"
            type="email"
            value={value.companyEmail}
            onChange={(e) => onChange({ companyEmail: e.target.value })}
          />
        </div>
      ) : null}
    </Box>
  );
}
