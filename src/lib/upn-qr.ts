import QRCode from "qrcode";
import { encode } from "upnqr";

// SI-model references (SI00...) only allow digits and up to two hyphens —
// banks reject letters with "Sklic vsebuje nepravilne znake". Our
// registration codes (e.g. "TC-5XT5H") contain letters, so we use the RF
// model instead (ISO 11649), which allows alphanumeric characters and is
// accepted SEPA-wide. Check digits computed per ISO 7064 MOD 97-10: append
// "RF00" to the reference, map letters to numbers (A=10 ... Z=35), take mod
// 97 of the resulting numeric string, and the check digits are 98 minus
// that remainder.
export function buildRfReference(rawReference: string): string {
  const clean = rawReference.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const numeric = `${clean}RF00`
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);
      return code >= 65 && code <= 90 ? String(code - 55) : char;
    })
    .join("");

  let remainder = 0;
  for (const digit of numeric) {
    remainder = (remainder * 10 + Number(digit)) % 97;
  }
  const checkDigits = String(98 - remainder).padStart(2, "0");

  return `RF${checkDigits}${clean}`;
}

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
