import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Typography";

export function ConfirmationSummary() {
  return (
    <div className="mx-auto mt-16 max-w-[680px]">
      <div className="flex items-center justify-between">
        <Eyebrow>Povzetek prijave</Eyebrow>
        <div className="flex items-center gap-4">
          <Button
            variant="action"
            icon={<Image src="/icon-calendar-white.svg" alt="" width={16} height={16} />}
          >
            Dodaj v Koledar
          </Button>
          <Button
            variant="action"
            icon={<Image src="/icon-print.svg" alt="" width={16} height={16} />}
          >
            Natisni
          </Button>
        </div>
      </div>
    </div>
  );
}
