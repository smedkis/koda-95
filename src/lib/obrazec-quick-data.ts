// Carries the termin-page quick form's fields (name/email/phone/consents)
// forward into the /obrazec wizard, which doesn't re-ask for them. Session
// storage rather than query params so this PII doesn't sit in the URL/
// browser history.
const KEY = "koda95_obrazec_quick_data";

export type QuickFormData = {
  fullName: string;
  email: string;
  phone: string;
  consentMarketing: boolean;
  consentTerms: boolean;
};

export function saveQuickFormData(data: QuickFormData) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, JSON.stringify(data));
}

export function loadQuickFormData(): QuickFormData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as QuickFormData) : null;
  } catch {
    return null;
  }
}

export function clearQuickFormData() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY);
}
