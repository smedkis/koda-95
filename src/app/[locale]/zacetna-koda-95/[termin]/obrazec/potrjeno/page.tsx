import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ConfirmationHelp } from "@/components/site/ConfirmationHelp";
import { Footer } from "@/components/site/Footer";
import { ObrazecConfirmedHeader } from "@/components/site/ObrazecConfirmedHeader";
import { ObrazecPaymentBox } from "@/components/site/ObrazecPaymentBox";
import { SectionDivider } from "@/components/site/SectionDivider";
import { generateUpnQrDataUrl } from "@/lib/upn-qr";

// Placeholder demo data — will be replaced with a real Supabase query keyed
// by the registration once the obrazec submission is wired up.
const PLACEHOLDER_PAYMENT = {
  amountValue: 50,
  reference: "TC-284",
  iban: "SI56 0400 0027 8541 552",
  recipientName: "Tahografi Cuderman d.o.o.",
};

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
  searchParams: Promise<{ payerType?: string; companyName?: string; companyEmail?: string }>;
}) {
  const { locale } = await params;
  const { payerType, companyName, companyEmail } = await searchParams;
  const isCompany = payerType === "company";

  const amount = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }).format(PLACEHOLDER_PAYMENT.amountValue);

  const qrDataUrl = isCompany
    ? undefined
    : await generateUpnQrDataUrl({
        amount: PLACEHOLDER_PAYMENT.amountValue,
        iban: PLACEHOLDER_PAYMENT.iban,
        reference: `SI00${PLACEHOLDER_PAYMENT.reference}`,
        recipientName: PLACEHOLDER_PAYMENT.recipientName,
        purpose: "Začetno usposabljanje Koda 95",
      });

  return (
    <Container>
      <ObrazecConfirmedHeader />
      <div className="mx-auto mt-16 max-w-[680px]">
        <ObrazecPaymentBox
          payerType={isCompany ? "company" : "self"}
          companyName={companyName}
          companyEmail={companyEmail}
          amount={amount}
          reference={PLACEHOLDER_PAYMENT.reference}
          iban={PLACEHOLDER_PAYMENT.iban}
          recipientName={PLACEHOLDER_PAYMENT.recipientName}
          qrDataUrl={qrDataUrl}
        />
      </div>
      <ConfirmationHelp />
      <div className="mt-32">
        <SectionDivider />
        <Footer />
      </div>
    </Container>
  );
}
