import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { DriverSearchResult } from "@/lib/data/registrations";

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

export async function generateRegistrationsPdf(
  registrations: DriverSearchResult[],
  monthLabel?: string,
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14;

  await registerFont(doc);

  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(16);
  doc.text(`Statistika prijav${monthLabel ? ` — ${monthLabel}` : ""}`, marginX, 20);

  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(10);
  doc.setTextColor(140);
  doc.text(`Izvoženo: ${new Date().toLocaleDateString("sl-SI")}`, pageWidth - marginX, 20, {
    align: "right",
  });
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 28,
    margin: { left: marginX, right: marginX },
    head: [["Št.", "Ime in priimek", "Datum prijave", "Termin"]],
    body: registrations.map(({ driver, terminTitle }, index) => [
      String(index + 1),
      driver.driverName,
      driver.registrationDate ?? "—",
      terminTitle,
    ]),
    styles: {
      font: FONT_FAMILY,
      fontSize: 9,
      cellPadding: 3,
      lineColor: [240, 240, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      font: FONT_FAMILY,
      fillColor: [250, 250, 250],
      textColor: [20, 20, 20],
      fontStyle: "bold",
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 55 },
      2: { cellWidth: 35 },
    },
    theme: "grid",
  });

  const fileSuffix = monthLabel
    ? monthLabel.replace(/\s+/g, "-")
    : new Date().toISOString().slice(0, 10);
  doc.save(`statistika-prijav-${fileSuffix}.pdf`);
}
