"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Eyebrow, Heading2, Text } from "@/components/ui/Typography";
import { subscribeToNotificationsAction } from "@/app/[locale]/actions";

// Breaks out to the full viewport width for the background/stroke while
// staying nested inside the page's single Container, so the container's
// left/right border lines stay continuous instead of stopping here.
export function SubscriptionSection() {
  const t = useTranslations("Subscription");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const isValid = name.trim().length > 0 && email.trim().length > 0 && consent;

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    const result = await subscribeToNotificationsAction({ name, email, phone });
    setIsSubmitting(false);
    if (result.error) {
      setStatus("error");
      return;
    }
    setStatus("success");
    setName("");
    setPhone("");
    setEmail("");
    setConsent(false);
  };

  return (
    <div className="mt-24 lg:mt-32 w-screen border-y border-divider ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]">
      <div className="mx-auto max-w-[1224px] border-container-border bg-secondary-bg px-4 sm:border-x sm:px-8">
        <div className="grid grid-cols-1 items-center gap-8 py-16 md:grid-cols-2 md:gap-16">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Image src="/bell.svg" alt="" width={24} height={24} className="size-6" />
              <Eyebrow className="text-primary">{t("eyebrow")}</Eyebrow>
            </div>
            <Heading2>{t("heading")}</Heading2>
            <Text>{t("description")}</Text>
          </div>
          <div className="flex flex-col gap-4">
            <Input
              type="text"
              label={t("name")}
              placeholder={t("name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              type="tel"
              label={t("phone")}
              placeholder={t("phone")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              type="email"
              label={t("email")}
              placeholder={t("email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Checkbox
              label={t("consent")}
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            {status === "success" ? (
              <Text className="text-[#006e5e]">{t("success")}</Text>
            ) : null}
            {status === "error" ? <Text className="text-red-600">{t("error")}</Text> : null}
            <Button
              variant="secondary"
              className="mt-4"
              disabled={!isValid || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? "…" : t("submit")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
