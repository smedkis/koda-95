import QRCode from "qrcode";
import { encode } from "upnqr";

// Generates a scannable UPN QR payment slip code (the Slovenian bank-app
// standard, spec: https://www.zbs-giz.si) as a PNG data URL, rendered at
// the ZBS-mandated error correction level M / version 15 (77x77).
export async function generateUpnQrDataUrl({
  amount,
  iban,
  reference,
  recipientName,
  purpose,
}: {
  amount: number;
  iban: string;
  reference: string;
  recipientName: string;
  purpose?: string;
}): Promise<string> {
  const payload = encode({
    znesek: amount,
    IBAN_prejemnika: iban.replace(/\s+/g, ""),
    referenca_prejemnika: reference.replace(/\s+/g, ""),
    ime_prejemnika: recipientName,
    koda_namena: "OTHR",
    namen_placila: purpose ?? "",
  });

  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    version: 15,
    margin: 0,
  });
}
