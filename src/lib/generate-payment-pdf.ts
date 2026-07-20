import jsPDF from "jspdf";
import { buildRfReference, generateUpnQrDataUrl } from "@/lib/upn-qr";
import { RECIPIENT_IBAN, RECIPIENT_NAME } from "@/lib/payment-info";

const FONT_FAMILY = "SourceSans3";

async function loadFontAsBase64(src: string): Promise<string> {
  const response = await fetch(src);
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Same rationale as generate-attendance-pdf.ts: jsPDF's built-in fonts don't
// support "č", so the site's own Source Sans 3 (latin-ext) is embedded.
async function registerFont(doc: jsPDF) {
  const [regular, bold] = await Promise.all([
    loadFontAsBase64("/fonts/SourceSans3-Regular.ttf"),
    loadFontAsBase64("/fonts/SourceSans3-Bold.ttf"),
  ]);
  doc.addFileToVFS("SourceSans3-Regular.ttf", regular);
  doc.addFont("SourceSans3-Regular.ttf", FONT_FAMILY, "normal");
  doc.addFileToVFS("SourceSans3-Bold.ttf", bold);
  doc.addFont("SourceSans3-Bold.ttf", FONT_FAMILY, "bold");
  doc.setFont(FONT_FAMILY, "normal");
}

function formatEur(amount: number): string {
  return new Intl.NumberFormat("sl-SI", { style: "currency", currency: "EUR" }).format(amount);
}

// A single-page printable payment slip for a driver to bring to the
// training — same recipient/IBAN/reference/QR shown on the public
// obrazec/potrjeno confirmation page, generated on demand from the admin
// driver view (e.g. for drivers added manually or missing the email).
export async function generatePaymentPdf({
  registrationCode,
  terminTitle,
  amountEur,
}: {
  registrationCode: string;
  terminTitle: string;
  amountEur: number;
}) {
  const reference = buildRfReference(registrationCode);
  const qrDataUrl = await generateUpnQrDataUrl({
    amount: amountEur,
    iban: RECIPIENT_IBAN,
    reference,
    recipientName: RECIPIENT_NAME,
    purpose: terminTitle,
  });

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14;

  await registerFont(doc);

  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(16);
  doc.text("Podatki za plačilo", marginX, 20);

  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(10);
  doc.setTextColor(140);
  doc.text(`Koda prijave: ${registrationCode}`, marginX, 28);
  doc.setTextColor(0);

  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(11);
  doc.text(terminTitle, marginX, 38);

  const qrSize = 60;
  const qrY = 46;
  doc.addImage(qrDataUrl, "PNG", marginX, qrY, qrSize, qrSize);

  const rows: [string, string][] = [
    ["Znesek", formatEur(amountEur)],
    ["IBAN", RECIPIENT_IBAN],
    ["Prejemnik", RECIPIENT_NAME],
    ["Referenca", reference],
  ];

  const textX = marginX + qrSize + 12;
  let rowY = qrY + 6;
  const rowHeight = 14;
  for (const [label, value] of rows) {
    doc.setFont(FONT_FAMILY, "normal");
    doc.setFontSize(9);
    doc.setTextColor(140);
    doc.text(label, textX, rowY);
    doc.setFont(FONT_FAMILY, "bold");
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(value, textX, rowY + 6);
    rowY += rowHeight;
  }

  const noticeY = Math.max(qrY + qrSize, rowY) + 14;
  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(12);
  doc.setTextColor(140);
  const noticeLines = doc.splitTextToSize(
    "QR koda velja samo za osebno spletno banko. Plačilo ni možno na pošti, banki, bencinskih servisih in drugih mestih, ki omogočajo plačevanje položnic.",
    pageWidth - marginX * 2,
  );
  doc.text(noticeLines, marginX, noticeY);
  doc.setTextColor(0);

  doc.save(`placilo-${registrationCode}.pdf`);
}
