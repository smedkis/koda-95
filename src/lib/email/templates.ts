import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { getTranslations } from "next-intl/server";
import type { PayerType } from "@/lib/supabase/database.types";
import type { EmailAttachment } from "./resend";

const LOGO_CONTENT_ID = "logo";

let logoAttachment: EmailAttachment | null = null;

// Embedded as an inline attachment (not a hosted-URL <img>) so the header
// renders correctly even before the site is deployed, and doesn't depend on
// the site being reachable from wherever the recipient opens the email.
export function getLogoAttachment(): EmailAttachment {
  logoAttachment ??= {
    filename: "logo.png",
    content: readFileSync(path.join(process.cwd(), "public/logo.png")).toString("base64"),
    contentId: LOGO_CONTENT_ID,
  };
  return logoAttachment;
}

// Table-based layout with inlined styles throughout — email clients don't
// reliably support flexbox/grid or external stylesheets.
function wrapEmail(locale: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="${locale}">
  <body style="margin:0;padding:0;background:#fafafa;font-family:Arial,Helvetica,sans-serif;color:#402e32;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #f0f0f0;">
            <tr>
              <td style="background:#fafafa;padding:20px 32px;border-bottom:1px solid #f0f0f0;">
                <img src="cid:${LOGO_CONTENT_ID}" alt="Tahografi Cuderman" width="140" height="53" style="display:block;" />
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                ${bodyHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

const NO_VALUE = "—";

function summaryRow(label: string, value: string): string {
  return `<tr><td style="padding:6px 0;color:#999999;font-size:13px;">${label}</td><td style="padding:6px 0;text-align:right;font-size:14px;">${value}</td></tr>`;
}

export async function buildQuickRegistrationEmail({
  locale,
  driverName,
  registrationCode,
  terminTitle,
  terminDate,
  timeRange,
  address,
  price,
  completeFormUrl,
}: {
  locale: string;
  driverName: string;
  registrationCode: string;
  terminTitle: string;
  terminDate: string;
  timeRange?: string;
  address?: string;
  price?: string;
  completeFormUrl: string;
}): Promise<{ subject: string; html: string }> {
  const t = await getTranslations({ locale, namespace: "Email.quickRegistration" });

  const summaryTable = `
    <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#000000;">${t("summaryHeading")}</p>
    <table role="presentation" width="100%" style="border-collapse:collapse;margin:0 0 24px;">
      ${summaryRow(t("driverLabel"), driverName)}
      ${summaryRow(t("terminLabel"), terminTitle)}
      ${summaryRow(t("dateLabel"), terminDate)}
      ${summaryRow(t("timeLabel"), timeRange ?? NO_VALUE)}
      ${summaryRow(t("priceLabel"), price ?? NO_VALUE)}
      ${summaryRow(t("locationLabel"), address ?? NO_VALUE)}
    </table>
  `;

  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#000000;">${t("heading")}</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${t("greeting", { name: driverName })}</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${t("body", { terminTitle, date: terminDate })}</p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">
      ${t("codeLabel")} <strong style="color:#f58220;">${registrationCode}</strong>
    </p>
    ${summaryTable}
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${t("completeCta")}</p>
    <p style="margin:0 0 8px;">
      <a href="${completeFormUrl}" style="display:inline-block;background:#f58220;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-size:15px;font-weight:600;">${t("completeButton")}</a>
    </p>
    <p style="margin:24px 0 0;font-size:13px;color:#999999;">${t("footer")}</p>
  `;
  return { subject: t("subject", { code: registrationCode }), html: wrapEmail(locale, body) };
}

export async function buildCompletionEmail({
  locale,
  driverName,
  registrationCode,
  terminTitle,
  terminDate,
  amount,
  payerType,
  companyName,
  iban,
  recipientName,
  reference,
  qrCid,
}: {
  locale: string;
  driverName: string;
  registrationCode: string;
  terminTitle: string;
  terminDate: string;
  amount: string | null;
  payerType: PayerType;
  companyName?: string | null;
  iban: string;
  recipientName: string;
  reference: string;
  qrCid?: string;
}): Promise<{ subject: string; html: string }> {
  const t = await getTranslations({ locale, namespace: "Email.completion" });

  const paymentSection = !amount
    ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${t("noPriceText")}</p>`
    : payerType === "company"
      ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${t("companyPaymentText", { amount, companyLabel: companyName ? ` ${companyName}` : "" })}</p>`
      : `
        <table role="presentation" width="100%" style="border-collapse:collapse;margin:0 0 24px;">
          <tr><td style="padding:6px 0;color:#999999;font-size:13px;">${t("amountLabel")}</td><td style="padding:6px 0;text-align:right;font-size:14px;font-weight:600;">${amount}</td></tr>
          <tr><td style="padding:6px 0;color:#999999;font-size:13px;">${t("ibanLabel")}</td><td style="padding:6px 0;text-align:right;font-size:14px;">${iban}</td></tr>
          <tr><td style="padding:6px 0;color:#999999;font-size:13px;">${t("recipientLabel")}</td><td style="padding:6px 0;text-align:right;font-size:14px;">${recipientName}</td></tr>
          <tr><td style="padding:6px 0;color:#999999;font-size:13px;">${t("referenceLabel")}</td><td style="padding:6px 0;text-align:right;font-size:14px;">${reference}</td></tr>
        </table>
        ${qrCid ? `<p style="text-align:center;margin:0 0 8px;"><img src="cid:${qrCid}" alt="UPN QR" width="180" height="180" /></p>` : ""}
      `;

  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#000000;">${t("heading")}</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${t("greeting", { name: driverName })}</p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">${t("body", { terminTitle, date: terminDate })}</p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">
      ${t("codeLabel")} <strong style="color:#f58220;">${registrationCode}</strong>
    </p>
    ${paymentSection}
    <p style="margin:24px 0 0;font-size:13px;color:#999999;">${t("footer")}</p>
  `;
  return { subject: t("subject", { code: registrationCode }), html: wrapEmail(locale, body) };
}

export async function buildFormReminderEmail({
  locale,
  driverName,
  terminTitle,
  terminDate,
  completeFormUrl,
}: {
  locale: string;
  driverName: string;
  terminTitle: string;
  terminDate: string;
  completeFormUrl: string;
}): Promise<{ subject: string; html: string }> {
  const t = await getTranslations({ locale, namespace: "Email.formReminder" });

  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#000000;">${t("heading")}</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${t("greeting", { name: driverName })}</p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">${t("body", { terminTitle, date: terminDate })}</p>
    <p style="margin:0 0 8px;">
      <a href="${completeFormUrl}" style="display:inline-block;background:#f58220;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-size:15px;font-weight:600;">${t("button")}</a>
    </p>
    <p style="margin:24px 0 0;font-size:13px;color:#999999;">${t("footer")}</p>
  `;
  return { subject: t("subject"), html: wrapEmail(locale, body) };
}

// Admin's bulk "Pošlji obvestilo" announcement — always Slovenian, same as
// the rest of admin. Narocniki aren't tied to a locale (they may never have
// registered at all), so there's no real per-recipient language to send in.
export function buildBulkNotificationEmail(termini: { title: string; href: string }[]): {
  subject: string;
  html: string;
} {
  const items = termini
    .map(
      (termin) =>
        `<li style="margin-bottom:8px;"><a href="${termin.href}" style="color:#f58220;font-weight:600;text-decoration:none;">${termin.title}</a></li>`,
    )
    .join("");

  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#000000;">Novi termini usposabljanja Koda 95</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Preverite razpoložljive termine in se prijavite:</p>
    <ul style="margin:0 0 24px;padding-left:20px;font-size:15px;line-height:1.6;">${items}</ul>
    <p style="margin:0;font-size:15px;line-height:1.6;">Za prijavo kliknite na termin zgoraj.</p>
  `;
  return { subject: "Novi termini usposabljanja Koda 95", html: wrapEmail("sl", body) };
}
