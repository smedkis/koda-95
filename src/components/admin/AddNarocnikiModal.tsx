"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { Heading3, Text } from "@/components/ui/Typography";
import type { AddNarocnikInput } from "@/lib/data/narocniki";

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4 shrink-0">
      <path d="M4 4L12 12M12 4L4 12" stroke="black" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function AddNarocnikiModal({
  error,
  onAdd,
  onClose,
}: {
  error?: string | null;
  onAdd: (entries: AddNarocnikInput[]) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = email.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    await onAdd([{ name, email, phone, source: "Ročno dodano" }]);
    setIsSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[420px] rounded-lg border border-divider bg-white p-8"
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
        <Heading3>Dodaj naročnika</Heading3>
        <div className="mt-6 flex flex-col gap-6">
          <Input
            label="Ime in priimek"
            placeholder="Ime in priimek"
            inputClassName="bg-secondary-bg"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            label="E-poštni naslov"
            placeholder="E-poštni naslov"
            type="email"
            required
            inputClassName="bg-secondary-bg"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <PhoneInput
            label="Telefonska številka"
            inputClassName="bg-secondary-bg"
            value={phone}
            onChange={setPhone}
          />
        </div>
        {error ? <Text className="mt-4 text-red-600">{error}</Text> : null}
        <Button
          type="button"
          variant="primary"
          className="mt-8 w-full justify-center"
          disabled={!isValid || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Dodajam …" : "Dodaj naročnika"}
        </Button>
      </div>
    </div>
  );
}
