"use server";

import { revalidatePath } from "next/cache";
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
  const result = await submitQuickRegistration(input);
  if (!("error" in result)) {
    revalidatePath("/admin/termini");
    revalidatePath("/admin/statistika");
    revalidatePath("/admin/obvescanje");
  }
  return result;
}

export async function completeRegistrationAction(
  code: string,
  input: CompleteRegistrationInput,
): Promise<CompleteRegistrationResult> {
  const result = await completeRegistration(code, input);
  if (!("error" in result)) {
    revalidatePath("/admin/statistika");
  }
  return result;
}

export async function subscribeToNotificationsAction(input: {
  name: string;
  email: string;
  phone: string;
}): Promise<{ error?: string }> {
  const result = await addNarocniki([
    { name: input.name, email: input.email, phone: input.phone, source: "Prijava na obvestila" },
  ]);
  if (!("error" in result)) {
    revalidatePath("/admin/obvescanje");
  }
  return "error" in result ? { error: result.error } : {};
}
