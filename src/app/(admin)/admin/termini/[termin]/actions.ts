"use server";

import { revalidatePath } from "next/cache";
import {
  createRegistration,
  deleteRegistration,
  moveRegistration,
  updateRegistration,
  type MutationResult,
} from "@/lib/data/registrations";
import type { TerminDriver } from "@/components/admin/AdminTerminDriversTable";

export async function createRegistrationAction(
  terminSlug: string,
  input: { fullName: string; email: string; phone: string },
): Promise<MutationResult> {
  const result = await createRegistration(terminSlug, input);
  if (!("error" in result)) {
    revalidatePath(`/admin/termini/${terminSlug}`);
    revalidatePath("/admin/termini");
  }
  return result;
}

export async function updateRegistrationAction(
  terminSlug: string,
  registrationId: string,
  driver: TerminDriver,
): Promise<MutationResult> {
  const result = await updateRegistration(terminSlug, registrationId, driver);
  if (!("error" in result)) {
    revalidatePath(`/admin/termini/${terminSlug}`);
    revalidatePath("/admin/termini");
  }
  return result;
}

export async function deleteRegistrationAction(
  terminSlug: string,
  registrationId: string,
): Promise<{ error?: string }> {
  const result = await deleteRegistration(terminSlug, registrationId);
  if (!result.error) {
    revalidatePath(`/admin/termini/${terminSlug}`);
    revalidatePath("/admin/termini");
  }
  return result;
}

export async function moveRegistrationAction(
  terminSlug: string,
  registrationId: string,
  targetTerminSlug: string,
): Promise<MutationResult> {
  const result = await moveRegistration(terminSlug, registrationId, targetTerminSlug);
  if (!("error" in result)) {
    revalidatePath(`/admin/termini/${terminSlug}`);
    revalidatePath(`/admin/termini/${targetTerminSlug}`);
    revalidatePath("/admin/termini");
  }
  return result;
}
