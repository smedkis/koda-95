"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import type { TerminDriver } from "./AdminTerminDriversTable";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Eyebrow, Text, TextMedium } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { PLACEHOLDER_DRIVERS } from "@/lib/admin-drivers-data";
import { updateDriverInTermin } from "@/lib/admin-drivers-store";

function CardHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Image src={icon} alt="" width={20} height={20} className="size-5" />
      <Eyebrow>{label}</Eyebrow>
    </div>
  );
}

const INPUT_BG = "bg-secondary-bg";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Eyebrow>{label}</Eyebrow>
      <Text>{value}</Text>
    </div>
  );
}

function YesNoToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const options: { label: string; val: boolean }[] = [
    { label: "Ne", val: false },
    { label: "Da", val: true },
  ];
  return (
    <div className="flex h-9 items-center gap-1 rounded border border-divider bg-[#F0F0F0] p-1">
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={() => onChange(option.val)}
          className={cn(
            "flex h-full w-14 cursor-pointer items-center justify-center rounded font-body text-[14px] font-medium",
            value === option.val ? "bg-white text-heading" : "text-placeholder",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3">
      <path
        d="M3 8.5L6.5 12L13 4.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type LogEntry = { message: string; timestamp: string };

function formatNow(): string {
  return new Date().toLocaleString("sl-SI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Placeholder history — once a real backend logs these events as they
// happen, this should be replaced with the actual stored log for the driver.
function buildInitialLog(driver: TerminDriver): LogEntry[] {
  const entries: LogEntry[] = [
    { message: "Izpolnjena prijava", timestamp: "20.04.2026 14:32" },
    { message: "Poslano prvo obvestilo za izpolnitev obrazca", timestamp: "22.04.2026 09:00" },
  ];
  if (driver.formStatus === "izpolnjen") {
    entries.push({
      message: `Voznik ${driver.driverName} izpolnil obrazec`,
      timestamp: "24.04.2026 18:47",
    });
  }
  if (driver.paymentStatus === "poravnano") {
    entries.push({ message: "Zabeleženo plačilo", timestamp: "25.04.2026 10:15" });
  }
  return entries;
}

function StatusStep({
  label,
  completed,
  isLast,
}: {
  label: string;
  completed: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full border-2",
            completed ? "border-secondary-dark bg-secondary-dark" : "border-divider bg-white",
          )}
        >
          {completed ? <CheckIcon /> : null}
        </span>
        {!isLast ? (
          <span className={cn("mt-1 w-0.5 flex-1", completed ? "bg-secondary-dark" : "bg-divider")} />
        ) : null}
      </div>
      <TextMedium className={cn("pb-6", completed ? "text-heading" : "text-placeholder")}>
        {label}
      </TextMedium>
    </div>
  );
}

export function AdminVoznikEditContent({
  terminId,
  initialDriver,
}: {
  terminId: string;
  initialDriver: TerminDriver;
}) {
  const router = useRouter();
  const [driver, setDriver] = useState(initialDriver);
  const [isSaving, setIsSaving] = useState(false);
  const [activityLog, setActivityLog] = useState<LogEntry[]>(() => buildInitialLog(initialDriver));

  const logEvent = (message: string) =>
    setActivityLog((current) => [...current, { message, timestamp: formatNow() }]);

  const update = <K extends keyof TerminDriver>(key: K, value: TerminDriver[K]) =>
    setDriver((current) => ({ ...current, [key]: value }));

  const handleSave = () => {
    setIsSaving(true);
    updateDriverInTermin(terminId, driver, PLACEHOLDER_DRIVERS);
    router.push(`/admin/termini/${terminId}`);
  };

  const step1Done = true;
  const step2Done = driver.formStatus === "izpolnjen";
  const step3Done = driver.paymentStatus === "poravnano";

  return (
    <div className="mt-16 grid grid-cols-2 gap-16">
      <div className="flex flex-col gap-8">
        <div>
          <CardHeader icon="/icon-profile.svg" label="Osebni podatki" />
          <Box className="bg-white">
            <div className="flex flex-col gap-6">
              <Input
                label="Voznik"
                inputClassName={INPUT_BG}
                value={driver.driverName}
                onChange={(event) => update("driverName", event.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Datum rojstva"
                  placeholder="DD.MM.LLLL"
                  inputClassName={INPUT_BG}
                  value={driver.dateOfBirth ?? ""}
                  onChange={(event) => update("dateOfBirth", event.target.value)}
                />
                <Input
                  label="Kraj rojstva"
                  inputClassName={INPUT_BG}
                  value={driver.birthPlace ?? ""}
                  onChange={(event) => update("birthPlace", event.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Država rojstva"
                  inputClassName={INPUT_BG}
                  value={driver.birthCountry ?? ""}
                  onChange={(event) => update("birthCountry", event.target.value)}
                />
                <Input
                  label="Državljanstvo"
                  inputClassName={INPUT_BG}
                  value={driver.citizenship ?? ""}
                  onChange={(event) => update("citizenship", event.target.value)}
                />
              </div>
              <Input
                label="EMŠO"
                inputClassName={INPUT_BG}
                value={driver.emso ?? ""}
                onChange={(event) => update("emso", event.target.value)}
              />
            </div>
          </Box>
        </div>

        <div>
          <CardHeader icon="/icon-call.svg" label="Kontaktni podatki" />
          <Box className="bg-white">
            <div className="flex flex-col gap-6">
              <Input
                label="E-pošta"
                type="email"
                inputClassName={INPUT_BG}
                value={driver.email ?? ""}
                onChange={(event) => update("email", event.target.value)}
              />
              <Input
                label="Telefon"
                type="tel"
                inputClassName={INPUT_BG}
                value={driver.phone ?? ""}
                onChange={(event) => update("phone", event.target.value)}
              />
            </div>
          </Box>
        </div>

        <div>
          <CardHeader icon="/icon-location.svg" label="Naslov" />
          <Box className="bg-white">
            <div className="flex flex-col gap-6">
              <Input
                label="Stalno prebivališče"
                inputClassName={INPUT_BG}
                value={driver.address ?? ""}
                onChange={(event) => update("address", event.target.value)}
              />
              <Input
                label="Začasno prebivališče"
                inputClassName={INPUT_BG}
                value={driver.tempAddress ?? ""}
                onChange={(event) => update("tempAddress", event.target.value)}
              />
            </div>
          </Box>
        </div>

        <div>
          <CardHeader icon="/Card.svg" label="Kategorija" />
          <Box className="bg-white">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <TextMedium>Kategorija C</TextMedium>
                <YesNoToggle
                  value={!!driver.categoryC}
                  onChange={(value) => update("categoryC", value)}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <TextMedium>Kategorija D</TextMedium>
                <YesNoToggle
                  value={!!driver.categoryD}
                  onChange={(value) => update("categoryD", value)}
                />
              </div>
            </div>
          </Box>
        </div>

        <Button
          type="button"
          variant="primary"
          className="self-start"
          disabled={isSaving}
          onClick={handleSave}
        >
          Shrani
        </Button>
      </div>

      <div className="flex flex-col gap-8">
        <div>
          <CardHeader icon="/Circle.svg" label="Status" />
          <Box className="bg-white">
            <div className="flex flex-col">
              <StatusStep label="Oddal prijavo" completed={step1Done} isLast={false} />
              <StatusStep label="Izpolnil obrazec" completed={step2Done} isLast={false} />
              <StatusStep label="Plačal" completed={step3Done} isLast />
            </div>
            {step2Done ? (
              <Button
                type="button"
                variant="action"
                className="w-full justify-center"
                disabled={step3Done}
                onClick={() => {
                  update("paymentStatus", "poravnano");
                  logEvent("Zabeleženo plačilo");
                }}
              >
                Označi kot plačano
              </Button>
            ) : (
              <Button
                type="button"
                variant="action"
                className="w-full justify-center"
                icon={<Image src="/bell-white.svg" alt="" width={16} height={16} />}
                onClick={() => logEvent("Ročno poslano obvestilo za izpolnitev obrazca")}
              >
                Pošlji obvestilo
              </Button>
            )}
            <div className="mt-6 mb-6 border-t border-divider" />
            <div className="flex flex-col gap-4">
              <InfoRow label="Način plačila" value={driver.paymentMethod ?? "—"} />
              <InfoRow label="Znesek" value={driver.paymentAmount ?? "—"} />
              <InfoRow label="Referenca" value={driver.paymentReference ?? "—"} />
            </div>
          </Box>
        </div>

        <div>
          <CardHeader icon="/icon-clock.svg" label="Zgodovina" />
          <Box className="bg-white">
            <div className="flex flex-col">
              {activityLog.map((entry, index) => (
                <div
                  key={index}
                  className={cn(
                    "py-3",
                    index === 0 && "pt-0",
                    index < activityLog.length - 1 && "border-b border-divider",
                  )}
                >
                  <Text className="text-[16px]">{entry.message}</Text>
                  <Text className="mt-1 text-[12px] text-placeholder">{entry.timestamp}</Text>
                </div>
              ))}
            </div>
          </Box>
        </div>
      </div>
    </div>
  );
}
