import { useLocale, useTranslations } from "next-intl";
import { Box } from "@/components/ui/Box";
import { Checkbox } from "@/components/ui/Checkbox";
import { Combobox } from "@/components/ui/Combobox";
import { Input } from "@/components/ui/Input";
import { Radio } from "@/components/ui/Radio";
import { Eyebrow } from "@/components/ui/Typography";
import { getCountries } from "@/lib/countries";
import { parseEmsoBirthDate } from "@/lib/emso";
import type { ObrazecFormData } from "@/lib/obrazec-form";
import { POSTAL_CODES } from "@/lib/postal-codes";

export function ObrazecStepPersonal({
  value,
  onChange,
}: {
  value: ObrazecFormData;
  onChange: (patch: Partial<ObrazecFormData>) => void;
}) {
  const t = useTranslations("Obrazec");
  const locale = useLocale();
  const countries = getCountries(locale);

  return (
    <Box className="flex flex-col gap-6">
      <Input
        label={t("placeOfBirth")}
        placeholder={t("placeOfBirth")}
        name="placeOfBirth"
        required
        value={value.placeOfBirth}
        onChange={(e) => onChange({ placeOfBirth: e.target.value })}
      />

      <Combobox
        label={t("countryOfBirth")}
        placeholder={t("selectCountry")}
        name="countryOfBirth"
        required
        value={value.countryOfBirth}
        onChange={(countryOfBirth) => onChange({ countryOfBirth })}
        options={countries}
      />

      <Combobox
        label={t("citizenship")}
        placeholder={t("selectCountry")}
        name="citizenship"
        required
        value={value.citizenship}
        onChange={(citizenship) => onChange({ citizenship })}
        options={countries}
      />

      <div className="flex flex-col gap-2">
        <Input
          label={t("emso")}
          placeholder={t("emso")}
          name="emso"
          inputMode="numeric"
          required={!value.noEmso}
          disabled={value.noEmso}
          maxLength={13}
          value={value.emso}
          onChange={(e) => {
            const emso = e.target.value.replace(/\D/g, "").slice(0, 13);
            const parsed = parseEmsoBirthDate(emso);
            onChange(parsed ? { emso, dateOfBirth: parsed } : { emso });
          }}
        />
        <Checkbox
          name="noEmso"
          label={t("noEmso")}
          checked={value.noEmso}
          onChange={(e) => {
            const noEmso = e.target.checked;
            onChange(noEmso ? { noEmso, emso: "" } : { noEmso });
          }}
        />
      </div>

      <Input
        label={t("dateOfBirth")}
        name="dateOfBirth"
        type="date"
        required
        value={value.dateOfBirth}
        onChange={(e) => onChange({ dateOfBirth: e.target.value })}
      />

      <div className="flex flex-col gap-2">
        <Eyebrow>{t("residenceType")}</Eyebrow>
        <div className="mt-2 flex flex-col gap-4">
          <Radio
            name="residenceType"
            value="permanent"
            label={t("permanentResidence")}
            checked={value.residenceType === "permanent"}
            onChange={() => onChange({ residenceType: "permanent" })}
          />
          <Radio
            name="residenceType"
            value="temporary"
            label={t("temporaryResidence")}
            checked={value.residenceType === "temporary"}
            onChange={() => onChange({ residenceType: "temporary" })}
          />
        </div>
      </div>

      {value.residenceType ? (
        <div className="flex flex-col gap-4">
          <Input
            label={t("address")}
            placeholder={t("addressPlaceholder")}
            name="address"
            required
            value={value.address}
            onChange={(e) => onChange({ address: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t("postalCode")}
              placeholder={t("postalCode")}
              name="postalCode"
              required
              value={value.postalCode}
              onChange={(e) => {
                const postalCode = e.target.value;
                const match = POSTAL_CODES[postalCode];
                onChange(match ? { postalCode, city: match } : { postalCode });
              }}
            />
            <Input
              label={t("city")}
              placeholder={t("city")}
              name="city"
              required
              value={value.city}
              onChange={(e) => onChange({ city: e.target.value })}
            />
          </div>
        </div>
      ) : null}
    </Box>
  );
}
