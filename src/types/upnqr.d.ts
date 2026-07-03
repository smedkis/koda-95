declare module "upnqr" {
  export function encode(fields: {
    polog?: boolean;
    dvig?: boolean;
    ime_placnika?: string;
    ulica_placnika?: string;
    kraj_placnika?: string;
    znesek?: number;
    nujno?: boolean;
    koda_namena?: string;
    namen_placila?: string;
    rok_placila?: Date;
    IBAN_prejemnika: string;
    referenca_prejemnika?: string;
    ime_prejemnika: string;
    ulica_prejemnika?: string;
    kraj_prejemnika?: string;
    rezerva?: string;
  }): string;

  export function decode(qrString: string): Record<string, unknown>;
}
