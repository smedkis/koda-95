export type ObrazecFormData = {
  categoryC: boolean;
  categoryD: boolean;
  placeOfBirth: string;
  countryOfBirth: string;
  citizenship: string;
  emso: string;
  dateOfBirth: string;
  residenceType: "permanent" | "temporary" | null;
  address: string;
  postalCode: string;
  city: string;
  payerType: "self" | "company";
  companyName: string;
  companyTaxNumber: string;
  companyEmail: string;
};

export const INITIAL_OBRAZEC_FORM_DATA: ObrazecFormData = {
  categoryC: false,
  categoryD: false,
  placeOfBirth: "",
  countryOfBirth: "",
  citizenship: "",
  emso: "",
  dateOfBirth: "",
  residenceType: null,
  address: "",
  postalCode: "",
  city: "",
  payerType: "self",
  companyName: "",
  companyTaxNumber: "",
  companyEmail: "",
};
