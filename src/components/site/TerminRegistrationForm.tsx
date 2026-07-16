"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Typography";
import { useRouter } from "@/i18n/navigation";
import { submitQuickRegistrationAction } from "@/app/[locale]/actions";
import type { ProgramKey } from "@/lib/supabase/database.types";

export function TerminRegistrationForm({
  daysUntil,
  program,
  dateISO,
  terminPath,
}: {
  daysUntil?: number;
  program: ProgramKey;
  dateISO: string;
  terminPath: string;
}) {
  const t = useTranslations("TerminRegistrationForm");
  const router = useRouter();
  const isNext = daysUntil !== undefined;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.trim().length > 0 &&
    consentTerms;

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    setError(null);
    const result = await submitQuickRegistrationAction({
      program,
      dateISO,
      fullName,
      email,
      phone,
      consentMarketing,
      consentTerms,
    });
    setIsSubmitting(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    router.push(`${terminPath}/potrjeno?prijava=${result.code}`);
  };

  return (
    <Box
      id="termin-registration-form"
      className={
        isNext
          ? "relative flex flex-col border border-primary pb-6"
          : "flex flex-col pb-6"
      }
    >
      {isNext ? (
        <span className="absolute left-6 top-0 inline-flex w-fit -translate-y-[calc(50%+1px)] items-center rounded-full bg-primary px-3 py-1.5 font-body text-[12px] font-semibold text-white">
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
      {error ? <Text className="mt-4 text-red-600">{error}</Text> : null}
      <Button
        variant="secondary"
        className="mt-8 w-full"
        disabled={!isValid || isSubmitting}
        onClick={handleSubmit}
      >
        {isSubmitting ? "…" : t("submit")}
      </Button>
      <Text className="mt-2 text-center text-[14px] font-medium text-[#006e5e]">
        Prijavi se zdaj, plačaj kasneje
      </Text>
    </Box>
  );
}
