"use server";

import { importZunanjaUsposabljanja } from "@/lib/data/zunanja-usposabljanja";
import type { ParsedZunanjeUsposabljanjeRow } from "@/lib/zunanja-usposabljanja-parse";

export async function importZunanjaUsposabljanjaAction(
  rows: ParsedZunanjeUsposabljanjeRow[],
): Promise<{ imported: number } | { error: string }> {
  return importZunanjaUsposabljanja(rows);
}
