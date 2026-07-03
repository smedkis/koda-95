import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Box } from "@/components/ui/Box";
import { Eyebrow, Text } from "@/components/ui/Typography";

function DetailIcon({ src }: { src: string }) {
  return <Image src={src} alt="" width={24} height={24} className="size-6 shrink-0" />;
}

function DetailRow({
  icon,
  label,
  value,
  showDivider = true,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
  showDivider?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {icon}
          <Eyebrow>{label}</Eyebrow>
        </div>
        <Text>{value}</Text>
      </div>
      {showDivider ? <div className="mt-4 mb-4 border-t border-divider" /> : null}
    </div>
  );
}

function InfoNotice({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded border border-[#C5C5C5] bg-[#F0F0F0] p-4">
      <Image src="/info.svg" alt="" width={24} height={24} className="size-6 shrink-0" />
      <Text>{children}</Text>
    </div>
  );
}

function QrCode({ dataUrl }: { dataUrl?: string }) {
  const t = useTranslations("Obrazec");
  if (!dataUrl) {
    return (
      <div className="flex size-[192px] shrink-0 items-center justify-center rounded border border-divider bg-white">
        <Text className="text-placeholder">{t("qrPlaceholder")}</Text>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- data URI, not an optimizable static asset
  return (
    <img
      src={dataUrl}
      alt={t("qrAlt")}
      className="size-[192px] shrink-0 rounded border border-divider bg-white"
    />
  );
}

export function ObrazecPaymentBox({
  payerType,
  amount,
  reference,
  iban,
  recipientName,
  companyName,
  companyEmail,
  qrDataUrl,
}: {
  payerType: "self" | "company";
  amount: string;
  reference: string;
  iban: string;
  recipientName: string;
  companyName?: string;
  companyEmail?: string;
  qrDataUrl?: string;
}) {
  const t = useTranslations("Obrazec");

  if (payerType === "company") {
    return (
      <Box className="flex flex-col gap-6">
        <Eyebrow>{t("paymentViaCompany")}</Eyebrow>
        <InfoNotice>{t("accountingNotice")}</InfoNotice>
        <div>
          <DetailRow
            icon={<DetailIcon src="/icon-profile.svg" />}
            label={t("companyName")}
            value={companyName ? companyName : t("noValue")}
          />
          <DetailRow
            icon={<DetailIcon src="/icon-message.svg" />}
            label={t("companyEmail")}
            value={companyEmail ? companyEmail : t("noValue")}
          />
          <DetailRow
            icon={<DetailIcon src="/icon-ticket.svg" />}
            label={t("amount")}
            value={amount}
            showDivider={false}
          />
        </div>
      </Box>
    );
  }

  return (
    <Box className="flex flex-col gap-6">
      <div className="flex gap-8">
        <QrCode dataUrl={qrDataUrl} />
        <div className="flex flex-1 flex-col text-left">
          <DetailRow label={t("recipient")} value={recipientName} />
          <DetailRow label={t("iban")} value={iban} />
          <DetailRow label={t("reference")} value={`SI00 ${reference}`} />
          <DetailRow label={t("amount")} value={amount} showDivider={false} />
        </div>
      </div>
      <InfoNotice>{t("qrOnlineOnly")}</InfoNotice>
    </Box>
  );
}
