"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Text } from "@/components/ui/Typography";
import { ConfirmationHelp } from "@/components/site/ConfirmationHelp";
import { ObrazecActions } from "@/components/site/ObrazecActions";
import { ObrazecHeader } from "@/components/site/ObrazecHeader";
import { ObrazecProgress } from "@/components/site/ObrazecProgress";
import { ObrazecStepCategory } from "@/components/site/ObrazecStepCategory";
import { ObrazecStepHeader } from "@/components/site/ObrazecStepHeader";
import { ObrazecStepPayment } from "@/components/site/ObrazecStepPayment";
import { ObrazecStepPersonal } from "@/components/site/ObrazecStepPersonal";
import { SectionDivider } from "@/components/site/SectionDivider";
import { Footer } from "@/components/site/Footer";
import { usePathname, useRouter } from "@/i18n/navigation";
import { INITIAL_OBRAZEC_FORM_DATA, type ObrazecFormData } from "@/lib/obrazec-form";
import { completeRegistrationAction } from "@/app/[locale]/actions";
import type { LicenceCategory } from "@/lib/supabase/database.types";

export function ObrazecForm() {
  const t = useTranslations("Obrazec");
  const locale = useLocale();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<ObrazecFormData>(INITIAL_OBRAZEC_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // /obrazec is only reachable with a code from the quick-form confirmation
  // (or, eventually, its email) — the registration itself already exists at
  // this point, this form only fills in the rest of it.
  const code = searchParams.get("prijava");
  const terminPath = pathname.replace(/\/obrazec$/, "");

  useEffect(() => {
    if (!code) {
      router.replace(terminPath);
    }
    // Only needs to run once on mount — pathname/code don't change under this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const STEP_TITLES = {
    1: t("step1Title"),
    2: t("step2Title"),
    3: t("step3Title"),
  } as const;

  const updateFormData = (patch: Partial<ObrazecFormData>) =>
    setFormData((current) => ({ ...current, ...patch }));

  const handleNext = async () => {
    if (step < 3) {
      setStep((current) => (current + 1) as 1 | 2 | 3);
      return;
    }

    if (!code) {
      router.replace(terminPath);
      return;
    }

    const licenceCategories: LicenceCategory[] = [
      ...(formData.categoryC ? (["C"] as const) : []),
      ...(formData.categoryD ? (["D"] as const) : []),
    ];

    setIsSubmitting(true);
    setSubmitError(null);
    const result = await completeRegistrationAction(code, {
      locale,
      licenceCategories,
      placeOfBirth: formData.placeOfBirth,
      countryOfBirth: formData.countryOfBirth,
      citizenship: formData.citizenship,
      emso: formData.emso,
      dateOfBirth: formData.dateOfBirth,
      residenceType: formData.residenceType ?? "permanent",
      address: formData.address,
      postalCode: formData.postalCode,
      city: formData.city,
      payerType: formData.payerType,
      companyName: formData.companyName,
      companyTaxNumber: formData.companyTaxNumber,
      companyEmail: formData.companyEmail,
    });
    setIsSubmitting(false);

    if ("error" in result) {
      setSubmitError(result.error);
      return;
    }

    router.push(`${terminPath}/obrazec/potrjeno?prijava=${code}`);
  };

  const handleBack = () => {
    setSubmitError(null);
    setStep((current) => (current - 1) as 1 | 2 | 3);
  };

  const step1Valid = formData.categoryC || formData.categoryD;
  const step2Valid =
    formData.placeOfBirth.trim() !== "" &&
    formData.countryOfBirth.trim() !== "" &&
    formData.citizenship.trim() !== "" &&
    formData.dateOfBirth.trim() !== "" &&
    formData.residenceType !== null &&
    formData.address.trim() !== "" &&
    formData.postalCode.trim() !== "" &&
    formData.city.trim() !== "";
  const step3Valid =
    formData.payerType === "self" || formData.companyName.trim() !== "";

  const nextDisabled =
    (step === 1 && !step1Valid) ||
    (step === 2 && !step2Valid) ||
    (step === 3 && (!step3Valid || isSubmitting));

  return (
    <>
      <ObrazecProgress step={step} />
      <Container>
        <ObrazecHeader />
        <ObrazecStepHeader sectionTitle={STEP_TITLES[step]} step={step} />
        <div className="mx-auto mt-4 max-w-[680px]">
          {step === 1 ? (
            <ObrazecStepCategory value={formData} onChange={updateFormData} />
          ) : null}
          {step === 2 ? (
            <ObrazecStepPersonal value={formData} onChange={updateFormData} />
          ) : null}
          {step === 3 ? (
            <ObrazecStepPayment value={formData} onChange={updateFormData} />
          ) : null}
          {submitError ? <Text className="mt-4 text-red-600">{submitError}</Text> : null}
        </div>
        <ObrazecActions
          showBack={step > 1}
          nextDisabled={nextDisabled}
          onNext={handleNext}
          onBack={handleBack}
        />
        <ConfirmationHelp />
        <div className="mt-24 lg:mt-32">
          <SectionDivider />
          <Footer />
        </div>
      </Container>
    </>
  );
}
