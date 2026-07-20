"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AdminBreadcrumbs } from "./AdminBreadcrumbs";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Heading2, Heading3, Text } from "@/components/ui/Typography";
import { sendBulkNotificationAction } from "@/app/(admin)/admin/obvescanje/actions";

export type TerminOption = {
  id: string;
  program: "redna" | "zacetna";
  date: string;
};

export type NarocnikStatus = "never" | "was_enrolled" | "enrolled";

export type NarocnikOption = {
  email: string;
  status: NarocnikStatus;
};

const PROGRAM_LABELS: Record<TerminOption["program"], string> = {
  redna: "Redno usposabljanje Koda 95",
  zacetna: "Začetno usposabljanje Koda 95",
};

const PROGRAM_ORDER: TerminOption["program"][] = ["redna", "zacetna"];

type Audience = { never: boolean; wasEnrolled: boolean; enrolled: boolean };
type Channels = { email: boolean };

const AUDIENCE_GROUPS: { key: keyof Audience; status: NarocnikStatus; label: string }[] = [
  { key: "never", status: "never", label: "Ni bil prijavljen" },
  { key: "wasEnrolled", status: "was_enrolled", label: "Bil prijavljen v preteklosti" },
  { key: "enrolled", status: "enrolled", label: "Trenutno prijavljen" },
];

function AudienceGroup({
  label,
  emails,
  checked,
  onChange,
}: {
  label: string;
  emails: string[];
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <Checkbox
          labelSize="md"
          label={`${label} (${emails.length})`}
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        {emails.length > 0 ? (
          <button
            type="button"
            className="cursor-pointer text-[13px] text-placeholder hover:text-paragraph hover:underline"
            onClick={() => setIsExpanded((current) => !current)}
          >
            {isExpanded ? "Skrij e-poštne naslove" : "Prikaži e-poštne naslove"}
          </button>
        ) : null}
      </div>
      {isExpanded ? (
        <div className="mt-2 ml-6 max-h-40 overflow-y-auto rounded border border-divider bg-secondary-bg p-3">
          {emails.map((email) => (
            <Text key={email} className="text-[13px]">
              {email}
            </Text>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PosljiObvestiloPageContent({
  termini,
  narocniki,
}: {
  termini: TerminOption[];
  narocniki: NarocnikOption[];
}) {
  const router = useRouter();

  const [audience, setAudience] = useState<Audience>({
    never: true,
    wasEnrolled: true,
    enrolled: false,
  });
  const [selectedTerminIds, setSelectedTerminIds] = useState<Set<string>>(
    () => new Set(termini.map((termin) => termin.id)),
  );
  const [channels, setChannels] = useState<Channels>({ email: true });
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const emailsByStatus = useMemo(() => {
    const map = new Map<NarocnikStatus, string[]>();
    for (const entry of narocniki) {
      const list = map.get(entry.status) ?? [];
      list.push(entry.email);
      map.set(entry.status, list);
    }
    return map;
  }, [narocniki]);

  const terminiByProgram = useMemo(() => {
    return PROGRAM_ORDER.map((program) => ({
      program,
      termini: termini.filter((termin) => termin.program === program),
    })).filter((group) => group.termini.length > 0);
  }, [termini]);

  const toggleProgram = (program: TerminOption["program"]) => {
    const programIds = termini.filter((termin) => termin.program === program).map((t) => t.id);
    const allProgramSelected = programIds.every((id) => selectedTerminIds.has(id));
    setSelectedTerminIds((current) => {
      const next = new Set(current);
      programIds.forEach((id) => (allProgramSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  const toggleTermin = (id: string) => {
    setSelectedTerminIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const hasAudience = audience.never || audience.wasEnrolled || audience.enrolled;
  const hasTermini = selectedTerminIds.size > 0;
  const hasChannel = channels.email;
  const canSend = hasAudience && hasTermini && hasChannel && !isSending;

  const handleSend = async () => {
    if (!canSend) return;
    setIsSending(true);
    setSendError(null);
    const result = await sendBulkNotificationAction(audience, Array.from(selectedTerminIds));
    setIsSending(false);
    if ("error" in result) {
      setSendError(result.error);
      return;
    }
    router.push("/admin/obvescanje");
  };

  return (
    <div className="mt-12 mb-24 lg:mt-20 lg:mb-32">
      <AdminBreadcrumbs
        items={[
          { label: "Termini", href: "/admin/termini" },
          { label: "Obveščanje", href: "/admin/obvescanje" },
          { label: "Pošlji obvestilo" },
        ]}
      />
      <Heading2>Pošlji obvestilo</Heading2>

      <Heading3 className="mt-8">1. Komu</Heading3>
      <Box className="mt-4 flex flex-col bg-white">
        <div className="flex flex-col gap-4">
          {AUDIENCE_GROUPS.map((group) => (
            <AudienceGroup
              key={group.key}
              label={group.label}
              emails={emailsByStatus.get(group.status) ?? []}
              checked={audience[group.key]}
              onChange={(checked) =>
                setAudience((current) => ({ ...current, [group.key]: checked }))
              }
            />
          ))}
        </div>
      </Box>

      <Heading3 className="mt-6">2. Termini</Heading3>
      <Box className="mt-4 flex flex-col bg-white">
        <div className="flex flex-col gap-4">
          {terminiByProgram.map(({ program, termini: programTermini }) => {
            const programIds = programTermini.map((termin) => termin.id);
            const programAllSelected = programIds.every((id) => selectedTerminIds.has(id));
            return (
              <div key={program} className="flex flex-col gap-2">
                <Checkbox
                  labelSize="md"
                  label={PROGRAM_LABELS[program]}
                  checked={programAllSelected}
                  onChange={() => toggleProgram(program)}
                />
                <div className="ml-6 flex flex-col gap-2">
                  {programTermini.map((termin) => (
                    <Checkbox
                      key={termin.id}
                      label={termin.date}
                      checked={selectedTerminIds.has(termin.id)}
                      onChange={() => toggleTermin(termin.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Box>

      <Heading3 className="mt-6">3. Način pošiljanja</Heading3>
      <Box className="mt-4 flex flex-col bg-white">
        <div className="flex flex-col gap-3">
          <Checkbox
            labelSize="md"
            label="E-poštno sporočilo"
            checked={channels.email}
            onChange={(event) =>
              setChannels((current) => ({ ...current, email: event.target.checked }))
            }
          />
          <Checkbox
            labelSize="md"
            label="Viber (kmalu)"
            className="cursor-not-allowed opacity-50"
            checked={false}
            disabled
            onChange={() => {}}
          />
        </div>
      </Box>

      {sendError ? <Text className="mt-4 text-red-600">{sendError}</Text> : null}
      <Button
        type="button"
        variant="primary"
        className="mt-8"
        disabled={!canSend}
        onClick={handleSend}
      >
        {isSending ? "Pošiljam …" : "Pošlji obvestilo"}
      </Button>
    </div>
  );
}
