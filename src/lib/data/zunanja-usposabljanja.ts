import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ProgramKey } from "@/lib/supabase/database.types";
import type { ParsedZunanjeUsposabljanjeRow } from "@/lib/zunanja-usposabljanja-parse";

export type ZunanjeUsposabljanjeEntry = {
  program: ProgramKey;
  modul: number | null;
  date: string;
  note: string | null;
};

export async function getZunanjaUsposabljanjaForVoznik(
  voznikId: string,
): Promise<ZunanjeUsposabljanjeEntry[]> {
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from("zunanja_usposabljanja")
    .select("program, modul, date, note")
    .eq("voznik_id", voznikId)
    .order("date", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

// Imports historical Koda 95 completions from another training provider.
// This legacy export has no EMŠO, so each row is matched/deduped against an
// existing voznik profile by phone number instead (it's the one field that
// repeats identically across a driver's rows — email can't be used, since
// several drivers share one company inbox). Never creates a fake termin or
// prijava, since those represent sessions we actually run — the completion
// lives only on the driver's profile. Processed sequentially (these are
// one-off, human-sized batches) so two rows for the same new phone number
// can't race and create duplicate profiles.
export async function importZunanjaUsposabljanja(
  rows: ParsedZunanjeUsposabljanjeRow[],
): Promise<{ imported: number } | { error: string }> {
  if (rows.length === 0) return { imported: 0 };
  const client = getSupabaseServerClient();
  const voznikIdByPhone = new Map<string, string>();
  let imported = 0;

  for (const row of rows) {
    let voznikId: string;

    if (row.phone) {
      const cached = voznikIdByPhone.get(row.phone);
      if (cached) {
        voznikId = cached;
      } else {
        // Not maybeSingle(): phone has no uniqueness guarantee across the
        // whole table (unlike emso), so more than one existing row could
        // share it — take the first match instead of erroring.
        const { data: existing, error: findError } = await client
          .from("vozniki")
          .select("id")
          .eq("phone", row.phone)
          .limit(1);
        if (findError) return { error: findError.message };

        if (existing && existing.length > 0) {
          voznikId = existing[0].id;
        } else {
          const { data: created, error: createError } = await client
            .from("vozniki")
            .insert({ full_name: row.fullName, email: row.email, phone: row.phone })
            .select("id")
            .single();
          if (createError) return { error: createError.message };
          voznikId = created.id;
        }
        voznikIdByPhone.set(row.phone, voznikId);
      }
    } else {
      const { data: created, error: createError } = await client
        .from("vozniki")
        .insert({ full_name: row.fullName, email: row.email })
        .select("id")
        .single();
      if (createError) return { error: createError.message };
      voznikId = created.id;
    }

    const { error: insertError } = await client.from("zunanja_usposabljanja").insert({
      voznik_id: voznikId,
      program: row.program,
      modul: row.modul,
      date: row.date,
      note: row.note,
    });
    if (insertError) return { error: insertError.message };

    // Also surface this driver in Obveščanje, same as a real registration
    // would (see syncNarocnikFromRegistration) — otherwise an imported
    // driver silently never appears in the contacts list. Skipped without
    // an email since narocniki.email is required and unique; two people
    // sharing one company inbox (seen in this export) will collapse into a
    // single contact row, which is inherent to that table being keyed by
    // email for bulk sending, not by person.
    if (row.email) {
      await client.from("narocniki").upsert(
        {
          full_name: row.fullName || null,
          email: row.email,
          phone: row.phone,
          voznik_id: voznikId,
          source: "Uvoz — pretekla usposabljanja",
        },
        { onConflict: "email" },
      );
    }

    imported += 1;
  }

  return { imported };
}
