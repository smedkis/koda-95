import { useTranslations } from "next-intl";
import { Box } from "@/components/ui/Box";
import { Checkbox } from "@/components/ui/Checkbox";
import type { ObrazecFormData } from "@/lib/obrazec-form";

export function ObrazecStepCategory({
  value,
  onChange,
}: {
  value: ObrazecFormData;
  onChange: (patch: Partial<ObrazecFormData>) => void;
}) {
  const t = useTranslations("Obrazec");
  return (
    <Box className="flex flex-col gap-4">
      <div className="flex items-center gap-8">
        <Checkbox
          name="categoryC"
          label={t("categoryC")}
          labelSize="md"
          checked={value.categoryC}
          onChange={(e) => onChange({ categoryC: e.target.checked })}
        />
        <Checkbox
          name="categoryD"
          label={t("categoryD")}
          labelSize="md"
          checked={value.categoryD}
          onChange={(e) => onChange({ categoryD: e.target.checked })}
        />
      </div>
    </Box>
  );
}
