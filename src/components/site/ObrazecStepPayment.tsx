import { useTranslations } from "next-intl";
import { useState } from "react";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Radio } from "@/components/ui/Radio";
import { Text } from "@/components/ui/Typography";
import { lookupCompanyAction } from "@/app/[locale]/actions";
import type { ObrazecFormData } from "@/lib/obrazec-form";

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4 shrink-0">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 14L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ObrazecStepPayment({
  value,
  onChange,
}: {
  value: ObrazecFormData;
  onChange: (patch: Partial<ObrazecFormData>) => void;
}) {
  const t = useTranslations("Obrazec");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = async () => {
    setIsSearching(true);
    setSearchError(null);
    const result = await lookupCompanyAction(value.companyTaxNumber);
    setIsSearching(false);
    if ("error" in result) {
      setSearchError(result.error);
      return;
    }
    onChange({ companyName: result.name });
  };

  return (
    <Box className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
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
          <div className="flex flex-col gap-2">
            <div className="flex items-end gap-2">
              <Input
                className="flex-1"
                label={t("companyTaxNumber")}
                placeholder={t("companyTaxNumber")}
                name="companyTaxNumber"
                value={value.companyTaxNumber}
                onChange={(e) => onChange({ companyTaxNumber: e.target.value })}
              />
              <Button
                type="button"
                variant="action"
                className="py-[10px]"
                icon={<SearchIcon />}
                disabled={isSearching || value.companyTaxNumber.trim() === ""}
                onClick={handleSearch}
              >
                {isSearching ? "…" : t("searchCompany")}
              </Button>
            </div>
            {searchError ? <Text className="text-[13px] text-red-600">{searchError}</Text> : null}
          </div>
          <Input
            label={t("companyName")}
            placeholder={t("companyName")}
            name="companyName"
            required
            value={value.companyName}
            onChange={(e) => onChange({ companyName: e.target.value })}
          />
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
