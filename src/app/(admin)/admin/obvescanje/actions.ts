"use server";

import { revalidatePath } from "next/cache";
import {
  addNarocniki,
  deleteNarocnik,
  type AddNarocnikInput,
} from "@/lib/data/narocniki";
import type { ObvescanjeEntry } from "@/components/admin/ObvescanjeTable";

export async function addNarocnikiAction(
  entries: AddNarocnikInput[],
): Promise<{ error: string } | { entries: ObvescanjeEntry[] }> {
  const result = await addNarocniki(entries);
  if (!("error" in result)) revalidatePath("/admin/obvescanje");
  return result;
}

export async function deleteNarocnikAction(id: string): Promise<{ error?: string }> {
  const result = await deleteNarocnik(id);
  if (!result.error) revalidatePath("/admin/obvescanje");
  return result;
}
