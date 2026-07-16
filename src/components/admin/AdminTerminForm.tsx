"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AdminTerminCard } from "./AdminTerminCard";
import {
  createTerminAction,
  deleteTerminAction,
  updateTerminAction,
} from "@/app/(admin)/admin/termini/actions";
import type { TerminFormData } from "@/lib/data/termini";
import { formatSlovenianDate, formatTimeRange } from "@/lib/termini-format";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Eyebrow, Heading3, Text } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";

type Program = "redna" | "zacetna";

// Confirmed Redna Koda 95 locations.
const LOCATION_PRESETS = ["Pot za krajem 35, 4000 Kranj", "Ljubljanska cesta 30, 4000 Kranj"];
const CUSTOM_LOCATION = "drugo";

// Redna Koda 95 is split into yearly modules (35h spread over 5 years) — the
// module year shows up in the termin title, independent of the session's
// actual calendar date. Začetna has no module concept, just dated sessions.
const MODUL_OPTIONS = ["2026", "2025", "2024", "2023", "2022", "2021", "2020"];

function ProgramToggle({
  program,
  onChange,
}: {
  program: Program;
  onChange: (program: Program) => void;
}) {
  const options: { value: Program; label: string }[] = [
    { value: "redna", label: "Redna Koda 95" },
    { value: "zacetna", label: "Začetna Koda 95" },
  ];
  return (
    <div className="flex h-11 items-center gap-1 rounded border border-divider bg-[#F0F0F0] p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "flex h-full flex-1 cursor-pointer items-center justify-center rounded px-4 font-body text-[16px] font-medium",
            program === option.value ? "bg-white text-heading" : "text-placeholder",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function AdminTerminForm({
  initialTermin,
  initialDate,
}: {
  initialTermin?: TerminFormData;
  initialDate?: string;
}) {
  const router = useRouter();
  const isEdit = !!initialTermin;

  const [program, setProgram] = useState<Program>(initialTermin?.program ?? "redna");
  const [modul, setModul] = useState(initialTermin?.modul ?? MODUL_OPTIONS[0]);
  const [date, setDate] = useState(initialTermin?.dateISO ?? initialDate ?? "");
  const [startTime, setStartTime] = useState(initialTermin?.startTime || "15:00");
  const [endTime, setEndTime] = useState(initialTermin?.endTime || "21:00");
  const [locationChoice, setLocationChoice] = useState(() => {
    const initialAddress = initialTermin?.address;
    if (initialAddress && !LOCATION_PRESETS.includes(initialAddress)) return CUSTOM_LOCATION;
    return initialAddress ?? LOCATION_PRESETS[0];
  });
  const [customAddress, setCustomAddress] = useState(() => {
    const initialAddress = initialTermin?.address;
    return initialAddress && !LOCATION_PRESETS.includes(initialAddress) ? initialAddress : "";
  });
  const address = locationChoice === CUSTOM_LOCATION ? customAddress : locationChoice;
  const [capacity, setCapacity] = useState(initialTermin?.capacity ?? 24);
  const [price, setPrice] = useState(initialTermin?.price?.match(/\d+/)?.[0] ?? "50");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Začetna Koda 95 has no fixed location, time, capacity or price — all
  // agreed individually — so none of those fields apply/are required.
  const isValid =
    date.length > 0 &&
    (program === "zacetna" ||
      (startTime.length > 0 && endTime.length > 0 && address.trim().length > 0 && capacity > 0));

  const title =
    program === "redna"
      ? `Redno usposabljanje Koda 95 (Modul ${modul})`
      : "Začetno usposabljanje Koda 95";

  const previewTermin = useMemo(() => {
    return {
      id: initialTermin?.id ?? (date ? `${program}-${date}` : `${program}-preview`),
      program,
      title,
      date: date ? formatSlovenianDate(date) : "Izberi datum",
      address: program === "redna" ? address || "Vnesi lokacijo" : undefined,
      timeRange: program === "redna" ? formatTimeRange(startTime, endTime) : undefined,
      attendeeCount: program === "zacetna" ? undefined : (initialTermin?.attendeeCount ?? 0),
      capacity: program === "zacetna" ? undefined : capacity || 0,
      registeredCount: initialTermin?.registeredCount ?? 0,
      formsCompletedCount: initialTermin?.formsCompletedCount ?? 0,
      paidCount: initialTermin?.paidCount ?? 0,
      isPast: initialTermin?.isPast,
      price: program === "redna" ? `${price} EUR z DDV` : undefined,
    };
  }, [initialTermin, program, title, date, address, startTime, endTime, capacity, price]);

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const input = {
      program,
      dateISO: date,
      startTime: program === "redna" ? startTime : undefined,
      endTime: program === "redna" ? endTime : undefined,
      address: program === "redna" ? address : undefined,
      capacity: program === "redna" ? capacity : undefined,
      price: program === "redna" ? Number(price) : undefined,
      modul: program === "redna" ? Number(modul) : undefined,
    };

    const result = isEdit
      ? await updateTerminAction(initialTermin.id, input)
      : await createTerminAction(input);

    setIsSubmitting(false);
    if ("error" in result) {
      setErrorMessage(result.error);
      return;
    }
    router.push(isEdit ? `/admin/termini/${result.slug}` : "/admin/termini");
  };

  const handleDelete = async () => {
    if (!initialTermin) return;
    setIsDeleting(true);
    setDeleteError(null);
    const result = await deleteTerminAction(initialTermin.id);
    setIsDeleting(false);
    if (result.error) {
      setDeleteError(result.error);
      return;
    }
    router.push("/admin/termini");
  };

  return (
    <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-2">
      <div>
        <Heading3>Podatki o terminu</Heading3>
        <div className="mt-6 flex flex-col gap-6">
          <div>
            <Eyebrow className="mb-2">Program</Eyebrow>
            <ProgramToggle program={program} onChange={setProgram} />
          </div>
          {program === "redna" ? (
            <Select
              label="Modul"
              required
              value={modul}
              onChange={(event) => setModul(event.target.value)}
            >
              {MODUL_OPTIONS.map((year) => (
                <option key={year} value={year}>
                  Modul {year}
                </option>
              ))}
            </Select>
          ) : null}
          <Input
            label="Datum"
            type="date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
          {program === "redna" ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Začetek"
                  type="time"
                  required
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                />
                <Input
                  label="Konec"
                  type="time"
                  required
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-4">
                <Select
                  label="Lokacija"
                  value={locationChoice}
                  onChange={(event) => setLocationChoice(event.target.value)}
                >
                  {LOCATION_PRESETS.map((preset) => (
                    <option key={preset} value={preset}>
                      {preset}
                    </option>
                  ))}
                  <option value={CUSTOM_LOCATION}>Drugo …</option>
                </Select>
                {locationChoice === CUSTOM_LOCATION ? (
                  <Input
                    label="Naslov"
                    placeholder="Vnesi naslov"
                    value={customAddress}
                    onChange={(event) => setCustomAddress(event.target.value)}
                  />
                ) : null}
              </div>
              <Input
                label="Kapaciteta"
                type="number"
                min={1}
                required
                value={capacity}
                onChange={(event) => setCapacity(Number(event.target.value))}
              />
              <Input
                label="Cena (EUR)"
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
              />
            </>
          ) : (
            <Text className="text-placeholder">
              Lokacija, ura, kapaciteta in cena so pri Začetni Kodi 95 po dogovoru.
            </Text>
          )}
        </div>
        {errorMessage ? <Text className="mt-4 text-red-600">{errorMessage}</Text> : null}
        <div className="mt-8 flex items-center justify-between">
          <Button
            type="button"
            variant="primary"
            disabled={!isValid || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Shranjujem …" : isEdit ? "Shrani spremembe" : "Dodaj termin"}
          </Button>
          {isEdit ? (
            <Button
              type="button"
              variant="secondary"
              className="bg-white text-red-600 outline outline-1 outline-red-200 hover:bg-red-50"
              onClick={() => {
                setDeleteError(null);
                setIsDeleteModalOpen(true);
              }}
            >
              Izbriši termin
            </Button>
          ) : null}
        </div>
      </div>
      <div className="hidden lg:block">
        <Heading3>Predogled</Heading3>
        <div className="mt-6">
          <AdminTerminCard {...previewTermin} showActions={false} />
        </div>
      </div>
      {isDeleteModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            className="relative w-full max-w-[420px] rounded-lg border border-divider bg-white p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <Heading3>Izbriši termin</Heading3>
            <Text className="mt-4">
              Ali ste prepričani, da želite izbrisati ta termin? Tega dejanja ni mogoče
              razveljaviti.
            </Text>
            {deleteError ? <Text className="mt-4 text-red-600">{deleteError}</Text> : null}
            <div className="mt-8 flex items-center justify-end gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Prekliči
              </Button>
              <Button
                type="button"
                variant="primary"
                className="bg-red-600 hover:bg-red-700"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? "Brišem …" : "Izbriši termin"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
