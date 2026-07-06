"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AdminBackLink } from "./AdminBackLink";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Heading2, Heading3 } from "@/components/ui/Typography";

export type TerminOption = {
  id: string;
  program: "redna" | "zacetna";
  date: string;
};

const PROGRAM_LABELS: Record<TerminOption["program"], string> = {
  redna: "Redno usposabljanje Koda 95",
  zacetna: "Začetno usposabljanje Koda 95",
};

const PROGRAM_ORDER: TerminOption["program"][] = ["redna", "zacetna"];

type Audience = { never: boolean; wasEnrolled: boolean; enrolled: boolean };
type Channels = { email: boolean; viber: boolean };

export function PosljiObvestiloPageContent({ termini }: { termini: TerminOption[] }) {
  const router = useRouter();

  const [audience, setAudience] = useState<Audience>({
    never: true,
    wasEnrolled: true,
    enrolled: false,
  });
  const [selectedTerminIds, setSelectedTerminIds] = useState<Set<string>>(
    () => new Set(termini.map((termin) => termin.id)),
  );
  const [channels, setChannels] = useState<Channels>({ email: true, viber: true });

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
  const hasChannel = channels.email || channels.viber;
  const canSend = hasAudience && hasTermini && hasChannel;

  const handleSend = () => {
    if (!canSend) return;
    router.push("/admin/obvescanje");
  };

  return (
    <div className="mt-32 mb-32">
      <AdminBackLink href="/admin/obvescanje" label="Obveščanje" />
      <Heading2 className="mt-4">Pošlji obvestilo</Heading2>

      <Heading3 className="mt-8">1. Komu</Heading3>
      <Box className="mt-4 flex flex-col bg-white">
        <div className="flex flex-col gap-3">
          <Checkbox
            labelSize="md"
            label="Ni bil prijavljen"
            checked={audience.never}
            onChange={(event) =>
              setAudience((current) => ({ ...current, never: event.target.checked }))
            }
          />
          <Checkbox
            labelSize="md"
            label="Bil prijavljen v preteklosti"
            checked={audience.wasEnrolled}
            onChange={(event) =>
              setAudience((current) => ({ ...current, wasEnrolled: event.target.checked }))
            }
          />
          <Checkbox
            labelSize="md"
            label="Trenutno prijavljen"
            checked={audience.enrolled}
            onChange={(event) =>
              setAudience((current) => ({ ...current, enrolled: event.target.checked }))
            }
          />
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
            label="Viber"
            checked={channels.viber}
            onChange={(event) =>
              setChannels((current) => ({ ...current, viber: event.target.checked }))
            }
          />
        </div>
      </Box>

      <Button
        type="button"
        variant="primary"
        className="mt-8"
        disabled={!canSend}
        onClick={handleSend}
      >
        Pošlji obvestilo
      </Button>
    </div>
  );
}
