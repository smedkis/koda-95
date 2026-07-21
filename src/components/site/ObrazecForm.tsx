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

type StepKind = "category" | "personal" | "payment";

// Only Začetno usposabljanje drivers have a licence category — Redno skips
// straight to personal details, so its wizard is 2 steps, not 3.
function stepsFor(program: "redna" | "zacetna"): StepKind[] {
  return program === "zacetna" ? ["category", "personal", "payment"] : ["personal", "payment"];
}

export function ObrazecForm({ program }: { program: "redna" | "zacetna" }) {
  const t = useTranslations("Obrazec");
  const locale = useLocale();
  const steps = stepsFor(program);
  const [stepIndex, setStepIndex] = useState(0);
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

  const STEP_TITLE_BY_KIND: Record<StepKind, string> = {
    category: t("step1Title"),
    personal: t("step2Title"),
    payment: t("step3Title"),
  };
  const currentStepKind = steps[stepIndex];

  const updateFormData = (patch: Partial<ObrazecFormData>) =>
    setFormData((current) => ({ ...current, ...patch }));

  const handleNext = async () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((current) => current + 1);
      return;
    }

    if (!code) {
      router.replace(terminPath);
      return;
    }

    const licenceCategories: LicenceCategory[] | null =
      program === "zacetna"
        ? [
            ...(formData.categoryC ? (["C"] as const) : []),
            ...(formData.categoryD ? (["D"] as const) : []),
            ...(formData.categoryDPartial ? (["D-delno"] as const) : []),
          ]
        : null;

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
    setStepIndex((current) => current - 1);
  };

  const stepValid: Record<StepKind, boolean> = {
    category: formData.categoryC || formData.categoryD || formData.categoryDPartial,
    personal:
      formData.placeOfBirth.trim() !== "" &&
      formData.countryOfBirth.trim() !== "" &&
      formData.citizenship.trim() !== "" &&
      (formData.noEmso || formData.emso.length === 13) &&
      formData.dateOfBirth.trim() !== "" &&
      formData.residenceType !== null &&
      formData.address.trim() !== "" &&
      formData.postalCode.trim() !== "" &&
      formData.city.trim() !== "",
    payment: formData.payerType === "self" || formData.companyName.trim() !== "",
  };

  const nextDisabled =
    !stepValid[currentStepKind] || (currentStepKind === "payment" && isSubmitting);

  return (
    <>
      <ObrazecProgress step={stepIndex + 1} totalSteps={steps.length} />
      <Container>
        <ObrazecHeader />
        <ObrazecStepHeader
          sectionTitle={STEP_TITLE_BY_KIND[currentStepKind]}
          step={stepIndex + 1}
          totalSteps={steps.length}
        />
        <div className="mx-auto mt-4 max-w-[680px]">
          {currentStepKind === "category" ? (
            <ObrazecStepCategory value={formData} onChange={updateFormData} />
          ) : null}
          {currentStepKind === "personal" ? (
            <ObrazecStepPersonal value={formData} onChange={updateFormData} />
          ) : null}
          {currentStepKind === "payment" ? (
            <ObrazecStepPayment value={formData} onChange={updateFormData} />
          ) : null}
          {submitError ? <Text className="mt-4 text-red-600">{submitError}</Text> : null}
        </div>
        <ObrazecActions
          showBack={stepIndex > 0}
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
