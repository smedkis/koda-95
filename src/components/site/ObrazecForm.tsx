"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
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

export function ObrazecForm() {
  const t = useTranslations("Obrazec");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<ObrazecFormData>(INITIAL_OBRAZEC_FORM_DATA);
  const router = useRouter();
  const pathname = usePathname();

  const STEP_TITLES = {
    1: t("step1Title"),
    2: t("step2Title"),
    3: t("step3Title"),
  } as const;

  const updateFormData = (patch: Partial<ObrazecFormData>) =>
    setFormData((current) => ({ ...current, ...patch }));

  const handleNext = () => {
    if (step < 3) {
      setStep((current) => (current + 1) as 1 | 2 | 3);
      return;
    }
    const query = new URLSearchParams({ payerType: formData.payerType });
    if (formData.payerType === "company") {
      query.set("companyName", formData.companyName);
      if (formData.companyEmail.trim() !== "") {
        query.set("companyEmail", formData.companyEmail);
      }
    }
    router.push(`${pathname}/potrjeno?${query.toString()}`);
  };

  const handleBack = () => setStep((current) => (current - 1) as 1 | 2 | 3);

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
    (step === 1 && !step1Valid) || (step === 2 && !step2Valid) || (step === 3 && !step3Valid);

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
