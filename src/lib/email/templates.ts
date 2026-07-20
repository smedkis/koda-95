import "server-only";
import type { PayerType } from "@/lib/supabase/database.types";

// Table-based layout with inlined styles throughout — email clients don't
// reliably support flexbox/grid or external stylesheets.
function wrapEmail(bodyHtml: string): string {
  return `<!doctype html>
<html lang="sl">
  <body style="margin:0;padding:0;background:#fafafa;font-family:Arial,Helvetica,sans-serif;color:#402e32;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #f0f0f0;">
            <tr>
              <td style="background:#000000;padding:20px 32px;">
                <span style="color:#ffffff;font-size:18px;font-weight:700;">Tahografi Cuderman</span>
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

export function buildQuickRegistrationEmail({
  driverName,
  registrationCode,
  terminTitle,
  terminDate,
  completeFormUrl,
}: {
  driverName: string;
  registrationCode: string;
  terminTitle: string;
  terminDate: string;
  completeFormUrl: string;
}): { subject: string; html: string } {
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#000000;">Prijava potrjena</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Pozdravljeni ${driverName},</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
      Vaša prijava na <strong>${terminTitle}</strong> (${terminDate}) je bila uspešno sprejeta.
    </p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">
      Koda prijave: <strong style="color:#f58220;">${registrationCode}</strong>
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
      Za dokončanje prijave (osebni podatki in način plačila) kliknite spodnjo povezavo:
    </p>
    <p style="margin:0 0 8px;">
      <a href="${completeFormUrl}" style="display:inline-block;background:#f58220;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-size:15px;font-weight:600;">Dokončaj prijavo</a>
    </p>
    <p style="margin:24px 0 0;font-size:13px;color:#999999;">Če prijave niste oddali vi, lahko to sporočilo prezrete.</p>
  `;
  return { subject: `Prijava potrjena — ${registrationCode}`, html: wrapEmail(body) };
}

export function buildCompletionEmail({
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
}): { subject: string; html: string } {
  const paymentSection = !amount
    ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Cena za ta termin še ni določena. O načinu plačila vas obvestimo naknadno po e-pošti.</p>`
    : payerType === "company"
      ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Plačilo v znesku <strong>${amount}</strong> bo izvedeno prek podjetja${companyName ? ` <strong>${companyName}</strong>` : ""} na podlagi izdanega računa.</p>`
      : `
        <table role="presentation" width="100%" style="border-collapse:collapse;margin:0 0 24px;">
          <tr><td style="padding:6px 0;color:#999999;font-size:13px;">Znesek</td><td style="padding:6px 0;text-align:right;font-size:14px;font-weight:600;">${amount}</td></tr>
          <tr><td style="padding:6px 0;color:#999999;font-size:13px;">IBAN</td><td style="padding:6px 0;text-align:right;font-size:14px;">${iban}</td></tr>
          <tr><td style="padding:6px 0;color:#999999;font-size:13px;">Prejemnik</td><td style="padding:6px 0;text-align:right;font-size:14px;">${recipientName}</td></tr>
          <tr><td style="padding:6px 0;color:#999999;font-size:13px;">Referenca</td><td style="padding:6px 0;text-align:right;font-size:14px;">${reference}</td></tr>
        </table>
        ${qrCid ? `<p style="text-align:center;margin:0 0 8px;"><img src="cid:${qrCid}" alt="UPN QR" width="180" height="180" /></p>` : ""}
      `;

  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#000000;">Prijava zaključena</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Pozdravljeni ${driverName},</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
      Uspešno ste dokončali prijavo na <strong>${terminTitle}</strong> (${terminDate}).
    </p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">
      Koda prijave: <strong style="color:#f58220;">${registrationCode}</strong>
    </p>
    ${paymentSection}
    <p style="margin:24px 0 0;font-size:13px;color:#999999;">Če imate vprašanja, odgovorite na to e-pošto.</p>
  `;
  return { subject: `Podatki za plačilo — ${registrationCode}`, html: wrapEmail(body) };
}
