import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { TerminDriver } from "@/components/admin/AdminTerminDriversTable";

const FONT_FAMILY = "SourceSans3";
const HEADER_HEIGHT = 46;
// Clearance the signature footer (stamp circle + text) needs below its
// baseline — not the same as the gap left between the table and that baseline.
const FOOTER_CLEARANCE = 20;
// Must exceed the stamp circle's radius (14mm) — otherwise the circle's top
// edge lands exactly on the table's bottom border, looking glued to it.
const TABLE_TO_FOOTER_GAP = 22;

async function loadImageAsDataUrl(src: string): Promise<string> {
  const response = await fetch(src);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

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

// jsPDF's built-in fonts (helvetica/times/courier) only support WinAnsi
// encoding, which is missing "č" — Slovenian text needs a real Unicode font,
// so we embed the same Source Sans 3 family (latin-ext) used on the website.
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

export async function generateAttendancePdf({
  id,
  title,
  modul,
  date,
  address,
  drivers,
}: {
  id: string;
  title: string;
  modul?: string;
  date: string;
  address: string;
  drivers: TerminDriver[];
}) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;

  await registerFont(doc);

  let logoDataUrl: string | null = null;
  try {
    logoDataUrl = await loadImageAsDataUrl("/logo.png");
  } catch {
    // Logo is a nice-to-have — the sheet is still usable without it.
  }

  // Redrawn on every page (via autoTable's didDrawPage hook below) so a
  // multi-page attendance list keeps its context on each sheet. Page numbers
  // are added in a separate final pass once the total page count is known.
  const drawHeader = () => {
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, "PNG", marginX, 10, 26.6, 10);
    }
    doc.setFont(FONT_FAMILY, "bold");
    doc.setFontSize(11);
    doc.text("PRILOGA 14", pageWidth - marginX, 15, { align: "right" });

    doc.setFontSize(16);
    doc.text(`Seznam navzočih${modul ? `: Modul ${modul}` : ""}`, marginX, 34);

    doc.setFont(FONT_FAMILY, "normal");
    doc.setFontSize(10);
    doc.text(`Datum: ${date}`, pageWidth - marginX, 29, { align: "right" });
    doc.text(`Kraj: ${address}`, pageWidth - marginX, 34, { align: "right" });

    doc.setFontSize(9);
    doc.setTextColor(140);
    doc.text(title, marginX, 40);
    doc.setTextColor(0);
  };

  const tableWidth = pageWidth - marginX * 2;
  const signatureColWidth = (tableWidth - 12 - 55 - 32 - 32) / 2;

  autoTable(doc, {
    startY: HEADER_HEIGHT,
    margin: { left: marginX, right: marginX, top: HEADER_HEIGHT },
    head: [
      [
        "Št.",
        "Ime in priimek",
        "Datum rojstva",
        "Telefon",
        "Podpis na začetku usposabljanja",
        "Podpis na koncu usposabljanja",
      ],
    ],
    body: drivers.map((driver, index) => [
      String(index + 1),
      driver.driverName,
      driver.dateOfBirth ?? "—",
      driver.phone ?? "—",
      "",
      "",
    ]),
    styles: {
      font: FONT_FAMILY,
      fontSize: 9,
      cellPadding: 3,
      lineColor: [240, 240, 240],
      lineWidth: 0.2,
      valign: "middle",
      minCellHeight: 12,
    },
    headStyles: {
      font: FONT_FAMILY,
      fillColor: [250, 250, 250],
      textColor: [20, 20, 20],
      fontStyle: "bold",
      fontSize: 7.5,
      valign: "middle",
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 55 },
      2: { cellWidth: 32 },
      3: { cellWidth: 32 },
      4: { cellWidth: signatureColWidth },
      5: { cellWidth: signatureColWidth },
    },
    theme: "grid",
    didDrawPage: () => drawHeader(),
  });

  let finalY =
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY +
    TABLE_TO_FOOTER_GAP;

  if (finalY + FOOTER_CLEARANCE > pageHeight - 10) {
    doc.addPage();
    drawHeader();
    finalY = HEADER_HEIGHT + TABLE_TO_FOOTER_GAP;
  }

  // Page numbers are only meaningful once every page (including a possible
  // extra footer-only page above) has actually been created.
  const totalPages = doc.getNumberOfPages();
  if (totalPages > 1) {
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      doc.setPage(pageNumber);
      doc.setFont(FONT_FAMILY, "normal");
      doc.setFontSize(9);
      doc.setTextColor(140);
      doc.text(`Stran ${pageNumber}/${totalPages}`, pageWidth - marginX, 40, { align: "right" });
      doc.setTextColor(0);
    }
    doc.setPage(totalPages);
  }

  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(10);
  doc.text("Kraj izvedbe:", marginX, finalY);
  doc.line(marginX + 24, finalY, marginX + 85, finalY);
  doc.text("Datum izvedbe:", marginX, finalY + 12);
  doc.line(marginX + 26, finalY + 12, marginX + 85, finalY + 12);

  const stampX = pageWidth / 2;
  doc.circle(stampX, finalY, 14);
  doc.setFontSize(8);
  doc.text("ŽIG", stampX, finalY, { align: "center" });

  doc.setFontSize(10);
  const sigLabel = "Podpis odgovorne osebe:";
  const sigLabelWidth = doc.getTextWidth(sigLabel);
  doc.text(sigLabel, pageWidth - marginX - 70, finalY);
  doc.line(pageWidth - marginX - 70 + sigLabelWidth + 2, finalY, pageWidth - marginX, finalY);

  doc.save(`priloga-14-${id}.pdf`);
}
