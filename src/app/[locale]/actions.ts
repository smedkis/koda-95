"use server";

import {
  submitPublicRegistration,
  type PublicRegistrationInput,
  type PublicRegistrationResult,
} from "@/lib/data/public-registration";
import { addNarocniki } from "@/lib/data/narocniki";

export async function submitRegistrationAction(
  input: PublicRegistrationInput,
): Promise<PublicRegistrationResult> {
  return submitPublicRegistration(input);
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
