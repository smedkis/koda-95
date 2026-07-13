"use server";

import {
  submitPublicRegistration,
  type PublicRegistrationInput,
  type PublicRegistrationResult,
} from "@/lib/data/public-registration";

export async function submitRegistrationAction(
  input: PublicRegistrationInput,
): Promise<PublicRegistrationResult> {
  return submitPublicRegistration(input);
}
