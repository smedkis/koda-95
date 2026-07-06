"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Eyebrow, Heading3, Text } from "@/components/ui/Typography";
import type { ObvescanjeEntry } from "./ObvescanjeTable";

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4 shrink-0">
      <path d="M4 4L12 12M12 4L4 12" stroke="black" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function isPhoneLike(value: string): boolean {
  return /^[+\d][\d\s()+-]{3,}$/.test(value);
}

// Fields can appear in any order and name/phone/source are all optional —
// the only field that's identified by position is whichever one contains
// "@" (the email). Everything else is assigned by shape: phone-looking
// values go to phone, the first remaining value goes to name, and any
// value after that goes to source.
function parsePastedText(
  text: string,
): { name: string; email: string; phone: string; source: string }[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) =>
      (line.includes("\t") ? line.split("\t") : line.split(","))
        .map((part) => part.trim())
        .filter(Boolean),
    )
    .map((fields) => {
      const emailIndex = fields.findIndex((field) => field.includes("@"));
      if (emailIndex === -1) return null;
      const email = fields[emailIndex];
      const rest = fields.filter((_, index) => index !== emailIndex);

      let name = "";
      let phone = "";
      let source = "";
      for (const field of rest) {
        if (!phone && isPhoneLike(field)) {
          phone = field;
        } else if (!name) {
          name = field;
        } else if (!source) {
          source = field;
        }
      }
      return { name, email, phone, source: source.length > 0 ? source : "Ročno dodano" };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);
}

export function AddNarocnikiModal({
  onAdd,
  onClose,
}: {
  onAdd: (entries: ObvescanjeEntry[]) => void;
  onClose: () => void;
}) {
  const [pastedText, setPastedText] = useState("");

  const parsedRows = useMemo(() => parsePastedText(pastedText), [pastedText]);

  const handleConfirm = () => {
    if (parsedRows.length === 0) return;
    const today = new Date().toISOString().slice(0, 10);
    const newEntries: ObvescanjeEntry[] = parsedRows.map((row, index) => ({
      id: `manual-${Date.now()}-${index}`,
      driverName: row.name,
      email: row.email,
      phone: row.phone,
      dateAdded: today,
      source: row.source,
      lastNotified: null,
      enrollment: { status: "never" },
    }));
    onAdd(newEntries);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[640px] rounded-lg border border-divider bg-white p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Zapri"
          className="absolute top-4 right-4 cursor-pointer"
        >
          <CloseIcon />
        </button>
        <Heading3>Dodaj naročnike</Heading3>
        <Text className="mt-4">
          Prilepi podatke iz Excela ali drugega seznama. Eno vrstico na osebo, v obliki: Ime
          Priimek, E-pošta, Telefonska številka, Vir (npr. podjetje). Edino e-pošta je obvezna,
          ostalo lahko izpustiš.
        </Text>
        <textarea
          value={pastedText}
          onChange={(event) => setPastedText(event.target.value)}
          placeholder={"Janez Novak, janez.novak@example.com, +386 41 123 456, Podjetje d.o.o."}
          rows={6}
          className="mt-4 w-full rounded border border-divider bg-white px-[14px] py-[10px] font-body text-[16px] text-paragraph placeholder-placeholder focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {pastedText.trim() ? (
          <div className="mt-6">
            <Eyebrow className="text-[14px]">Predogled ({parsedRows.length})</Eyebrow>
            <div className="mt-2 max-h-[240px] overflow-y-auto rounded-lg border border-divider">
              {parsedRows.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Text className="text-[14px] text-placeholder">
                    Ni prepoznanih vrstic. Preveri obliko podatkov.
                  </Text>
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <tbody>
                    {parsedRows.map((row, index) => (
                      <tr
                        key={`${row.email}-${index}`}
                        className={index < parsedRows.length - 1 ? "border-b border-divider" : ""}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Text className="text-[14px]">{row.name}</Text>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Text className="text-[14px]">{row.email}</Text>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Text className="text-[14px]">{row.phone}</Text>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Text className="text-[14px]">{row.source}</Text>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : null}
        <Button
          type="button"
          variant="primary"
          className="mt-8 w-full justify-center"
          disabled={parsedRows.length === 0}
          onClick={handleConfirm}
        >
          Dodaj {parsedRows.length > 0 ? `(${parsedRows.length})` : ""}
        </Button>
      </div>
    </div>
  );
}
