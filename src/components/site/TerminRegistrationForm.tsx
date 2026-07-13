"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Typography";
import { useRouter } from "@/i18n/navigation";
import { saveQuickFormData } from "@/lib/obrazec-quick-data";

export function TerminRegistrationForm({
  daysUntil,
  obrazecHref,
}: {
  daysUntil?: number;
  obrazecHref: string;
}) {
  const t = useTranslations("TerminRegistrationForm");
  const router = useRouter();
  const isNext = daysUntil !== undefined;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);

  const isValid =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.trim().length > 0 &&
    consentTerms;

  const handleSubmit = () => {
    if (!isValid) return;
    saveQuickFormData({ fullName, email, phone, consentMarketing, consentTerms });
    router.push(obrazecHref);
  };

  return (
    <Box
      id="termin-registration-form"
      className={
        isNext
          ? "relative flex flex-col border-2 border-transparent pb-6 shadow-[0_16px_36px_-20px_rgba(245,130,32,0.45)]"
          : "flex flex-col pb-6"
      }
      style={
        isNext
          ? {
              // Same flat fill as a regular card's bg-secondary-bg — only the
              // border keeps its orange gradient to mark this as "next".
              backgroundImage: "linear-gradient(#FAFAFA, #FAFAFA), linear-gradient(90deg, #f58220, #ffab5c)",
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
      <Input
        label={t("fullName")}
        placeholder={t("fullName")}
        name="fullName"
        required
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />
      <Input
        label={t("email")}
        placeholder={t("email")}
        name="email"
        type="email"
        required
        className="mt-6"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label={t("phone")}
        placeholder={t("phone")}
        name="phone"
        type="tel"
        required
        className="mt-6"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <Checkbox
        name="consentMarketing"
        label={t("consentMarketing")}
        className="mt-6"
        checked={consentMarketing}
        onChange={(e) => setConsentMarketing(e.target.checked)}
      />
      <Checkbox
        name="consentTerms"
        required
        label={t("consentTerms")}
        className="mt-4"
        checked={consentTerms}
        onChange={(e) => setConsentTerms(e.target.checked)}
      />
      <Button variant="secondary" className="mt-8 w-full" disabled={!isValid} onClick={handleSubmit}>
        {t("submit")}
      </Button>
      <Text className="mt-2 text-center text-[14px] font-medium text-[#006e5e]">
        Prijavi se zdaj, plačaj kasneje
      </Text>
    </Box>
  );
}
