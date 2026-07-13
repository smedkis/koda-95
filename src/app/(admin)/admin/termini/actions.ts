"use server";

import { revalidatePath } from "next/cache";
import {
  createTermin,
  updateTermin,
  type TerminInput,
  type TerminMutationResult,
} from "@/lib/data/termini";

export async function createTerminAction(input: TerminInput): Promise<TerminMutationResult> {
  const result = await createTermin(input);
  if (!("error" in result)) {
    revalidatePath("/admin/termini");
  }
  return result;
}

export async function updateTerminAction(
  slug: string,
  input: TerminInput,
): Promise<TerminMutationResult> {
  const result = await updateTermin(slug, input);
  if (!("error" in result)) {
    revalidatePath("/admin/termini");
    revalidatePath(`/admin/termini/${slug}`);
  }
  return result;
}
