"use client";

import { useState } from "react";
import type { TerminDriver } from "./AdminTerminDriversTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Heading3, Text } from "@/components/ui/Typography";

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4 shrink-0">
      <path d="M4 4L12 12M12 4L4 12" stroke="black" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function AddVoznikModal({
  onAdd,
  onClose,
}: {
  onAdd: (driver: TerminDriver) => void;
  onClose: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const isValid = fullName.trim().length > 0 && email.trim().length > 0 && phone.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    onAdd({
      id: `manual-${Date.now()}`,
      driverName: fullName,
      email,
      phone,
      formStatus: "manjka",
      paymentStatus: "caka",
      payer: "sam",
    });
    onClose();
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
        <Heading3>Dodaj voznika</Heading3>
        <Text className="mt-4">
          Isti podatki, ki jih izpolni voznik ob prijavi. Voznik nato po e-pošti prejme povezavo
          za dokončanje obrazca.
        </Text>
        <div className="mt-6 flex flex-col gap-6">
          <Input
            label="Ime in priimek"
            placeholder="Ime in priimek"
            required
            inputClassName="bg-secondary-bg"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
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
          <Input
            label="Telefonska številka"
            placeholder="Telefonska številka"
            type="tel"
            required
            inputClassName="bg-secondary-bg"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="primary"
          className="mt-8 w-full justify-center"
          disabled={!isValid}
          onClick={handleSubmit}
        >
          Dodaj voznika
        </Button>
      </div>
    </div>
  );
}
