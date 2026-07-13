"use server";

import {
  completeRegistration,
  submitQuickRegistration,
  type CompleteRegistrationInput,
  type CompleteRegistrationResult,
  type QuickRegistrationInput,
  type QuickRegistrationResult,
} from "@/lib/data/public-registration";
import { addNarocniki } from "@/lib/data/narocniki";

export async function submitQuickRegistrationAction(
  input: QuickRegistrationInput,
): Promise<QuickRegistrationResult> {
  return submitQuickRegistration(input);
}

export async function completeRegistrationAction(
  code: string,
  input: CompleteRegistrationInput,
): Promise<CompleteRegistrationResult> {
  return completeRegistration(code, input);
}

export async function subscribeToNotificationsAction(input: {
  name: string;
  email: string;
  phone: string;
}): Promise<{ error?: string }> {
  const result = await addNarocniki([
    { name: input.name, email: input.email, phone: input.phone, source: "Prijava na obvestila" },
  ]);
  return "error" in result ? { error: result.error } : {};
}
