import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ConfirmationHelp } from "@/components/site/ConfirmationHelp";
import { Footer } from "@/components/site/Footer";
import { ObrazecConfirmedHeader } from "@/components/site/ObrazecConfirmedHeader";
import { ObrazecPaymentBox } from "@/components/site/ObrazecPaymentBox";
import { SectionDivider } from "@/components/site/SectionDivider";
import { buildRfReference, generateUpnQrDataUrl } from "@/lib/upn-qr";
import { getRegistrationByCode } from "@/lib/data/public-registration";
import { RECIPIENT_IBAN, RECIPIENT_NAME } from "@/lib/payment-info";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Obrazec");
  return {
    title: `${t("pageTitle")} | Tahografi Cuderman`,
    robots: { index: false, follow: false },
  };
}

export default async function ObrazecPotrjenoPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ prijava?: string }>;
}) {
  const { locale } = await params;
  const { prijava } = await searchParams;
  const registration = prijava ? await getRegistrationByCode(prijava, locale) : null;
  if (!registration) notFound();

  const t = await getTranslations("Obrazec");

  const isCompany = registration.payerType === "company";
  const hasPrice = registration.priceEur !== null;

  const amount = hasPrice
    ? new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(
        registration.priceEur as number,
      )
    : null;

  const reference = buildRfReference(registration.registrationCode);

  const qrDataUrl =
    !isCompany && hasPrice
      ? await generateUpnQrDataUrl({
          amount: registration.priceEur as number,
          iban: RECIPIENT_IBAN,
          reference,
          recipientName: RECIPIENT_NAME,
          purpose: registration.terminTitle,
        })
      : undefined;

  return (
    <Container>
      <ObrazecConfirmedHeader description={hasPrice ? undefined : t("noPriceNotice")} />
      {hasPrice ? (
        <div className="mx-auto mt-16 max-w-[680px]">
          <ObrazecPaymentBox
            payerType={isCompany ? "company" : "self"}
            companyName={registration.companyName ?? undefined}
            companyEmail={registration.companyEmail ?? undefined}
            amount={amount as string}
            reference={reference}
            iban={RECIPIENT_IBAN}
            recipientName={RECIPIENT_NAME}
            qrDataUrl={qrDataUrl}
          />
        </div>
      ) : null}
      <ConfirmationHelp />
      <div className="mt-24 lg:mt-32">
        <SectionDivider />
        <Footer />
      </div>
    </Container>
  );
}
