"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AddNarocnikiModal } from "./AddNarocnikiModal";
import { ObvescanjeTable, type ObvescanjeEntry } from "./ObvescanjeTable";
import { Button } from "@/components/ui/Button";
import { Heading2, Heading3 } from "@/components/ui/Typography";
import { addNarocnikiAction, deleteNarocnikAction } from "@/app/(admin)/admin/obvescanje/actions";
import type { AddNarocnikInput } from "@/lib/data/narocniki";

export function ObvescanjePageContent({
  initialEntries,
}: {
  initialEntries: ObvescanjeEntry[];
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const previous = entries;
    setEntries((current) => current.filter((entry) => entry.id !== id));
    const result = await deleteNarocnikAction(id);
    if (result.error) setEntries(previous);
  };

  const handleAdd = async (parsedRows: AddNarocnikInput[]) => {
    setAddError(null);
    const result = await addNarocnikiAction(parsedRows);
    if ("error" in result) {
      setAddError(result.error);
      return;
    }
    setEntries((current) => [...result.entries, ...current]);
    setIsAddOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading2>Obveščanje</Heading2>
        <Link
          href="/admin/obvescanje/posiljanje"
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-primary px-[14px] py-[10px] font-body text-[16px] font-medium text-white transition-colors hover:bg-[#d06e1b]"
        >
          <Image src="/bell-white.svg" alt="" width={16} height={16} className="size-4 shrink-0" />
          Pošlji obvestilo
        </Link>
      </div>
      <div className="mt-16 flex items-center justify-between">
        <Heading3>Naročniki ({entries.length})</Heading3>
        <Button
          type="button"
          variant="action"
          icon={<Image src="/plus.svg" alt="" width={13} height={13} />}
          onClick={() => setIsAddOpen(true)}
        >
          Dodaj
        </Button>
      </div>
      <div className="mt-6">
        <ObvescanjeTable entries={entries} onDelete={handleDelete} />
      </div>
      {isAddOpen ? (
        <AddNarocnikiModal
          error={addError}
          onAdd={handleAdd}
          onClose={() => {
            setAddError(null);
            setIsAddOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
