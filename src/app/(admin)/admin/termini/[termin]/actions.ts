"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  createRegistration,
  deleteRegistration,
  markRegistrationPaid,
  moveRegistration,
  sendFormReminder,
  updateRegistration,
  type MutationResult,
} from "@/lib/data/registrations";
import { parseTerminSeenMap, TERMIN_SEEN_COOKIE } from "@/lib/termin-seen";
import type { TerminDriver } from "@/components/admin/AdminTerminDriversTable";

// Called on mount from the termin detail page — marks "now" as seen for that
// termin so its calendar chip's unread badge resets.
export async function markTerminSeenAction(terminSlug: string): Promise<void> {
  const cookieStore = await cookies();
  const seenMap = parseTerminSeenMap(cookieStore.get(TERMIN_SEEN_COOKIE)?.value);
  seenMap[terminSlug] = new Date().toISOString();
  cookieStore.set(TERMIN_SEEN_COOKIE, JSON.stringify(seenMap), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function createRegistrationAction(
  terminSlug: string,
  input: { fullName: string; email: string; phone: string; notify: boolean },
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
    revalidatePath(`/admin/termini/${terminSlug}/vozniki/${registrationId}`);
    revalidatePath("/admin/termini");
  }
  return result;
}

export async function markRegistrationPaidAction(
  terminSlug: string,
  registrationId: string,
): Promise<MutationResult> {
  const result = await markRegistrationPaid(terminSlug, registrationId);
  if (!("error" in result)) {
    revalidatePath(`/admin/termini/${terminSlug}`);
    revalidatePath(`/admin/termini/${terminSlug}/vozniki/${registrationId}`);
    revalidatePath("/admin/termini");
  }
  return result;
}

export async function sendFormReminderAction(
  terminSlug: string,
  registrationId: string,
): Promise<{ error?: string }> {
  const result = await sendFormReminder(terminSlug, registrationId);
  if (!result.error) {
    revalidatePath(`/admin/termini/${terminSlug}/vozniki/${registrationId}`);
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
    revalidatePath(`/admin/termini/${terminSlug}/vozniki/${registrationId}`);
    revalidatePath(`/admin/termini/${targetTerminSlug}`);
    revalidatePath(`/admin/termini/${targetTerminSlug}/vozniki/${registrationId}`);
    revalidatePath("/admin/termini");
  }
  return result;
}
