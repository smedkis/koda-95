import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Eyebrow, Heading2 } from "@/components/ui/Typography";

// Breaks out to the full viewport width for the background/stroke while
// staying nested inside the page's single Container, so the container's
// left/right border lines stay continuous instead of stopping here.
export function SubscriptionSection() {
  const t = useTranslations("Subscription");
  return (
    <div className="mt-32 w-screen border-y border-divider ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]">
      <div className="mx-auto max-w-[1224px] border-x border-container-border bg-secondary-bg px-8">
        <div className="grid grid-cols-2 items-center gap-16 py-16">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Image src="/bell.svg" alt="" width={24} height={24} className="size-6" />
              <Eyebrow className="text-primary">{t("eyebrow")}</Eyebrow>
            </div>
            <Heading2>{t("heading")}</Heading2>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-end gap-4">
              <Input
                type="email"
                label={t("email")}
                placeholder={t("email")}
                className="w-72"
              />
              <Button variant="secondary">{t("submit")}</Button>
            </div>
            <Checkbox label={t("consent")} />
          </div>
        </div>
      </div>
    </div>
  );
}
