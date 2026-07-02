import Image from "next/image";
import type { ReactNode } from "react";
import { Box } from "@/components/ui/Box";
import { Eyebrow, Text } from "@/components/ui/Typography";

function DetailIcon({ src }: { src: string }) {
  return <Image src={src} alt="" width={24} height={24} className="size-6 shrink-0" />;
}

function HashIcon() {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center font-heading text-[18px] font-semibold text-primary">
      #
    </span>
  );
}

function DetailRow({
  icon,
  label,
  value,
  showDivider = true,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  showDivider?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {icon}
          <Eyebrow>{label}</Eyebrow>
        </div>
        <Text>{value}</Text>
      </div>
      {showDivider ? <div className="mt-4 mb-4 border-t border-divider" /> : null}
    </div>
  );
}

export function ConfirmationDetails({
  driver,
  termin,
  time,
  price,
  registrationCode,
  location,
}: {
  driver: string;
  termin: string;
  time: string;
  price: string;
  registrationCode: string;
  location: string;
}) {
  const rows = [
    { icon: <DetailIcon src="/icon-profile.svg" />, label: "Voznik", value: driver },
    { icon: <DetailIcon src="/icon-calendar.svg" />, label: "Termin", value: termin },
    { icon: <DetailIcon src="/icon-clock.svg" />, label: "Ura", value: time },
    { icon: <DetailIcon src="/icon-ticket.svg" />, label: "Cena", value: price },
    { icon: <HashIcon />, label: "Številka prijave", value: registrationCode },
    { icon: <DetailIcon src="/icon-location.svg" />, label: "Lokacija", value: location },
  ];

  return (
    <div className="mx-auto mt-6 max-w-[680px]">
      <Box>
        {rows.map((row, index) => (
          <DetailRow key={row.label} {...row} showDivider={index < rows.length - 1} />
        ))}
        <div className="-mx-8 -mb-8 mt-4 aspect-video overflow-hidden rounded-b-lg">
          <iframe
            src={`https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`}
            className="h-full w-full border-0"
            loading="lazy"
            title="Lokacija termina"
          />
        </div>
      </Box>
    </div>
  );
}
