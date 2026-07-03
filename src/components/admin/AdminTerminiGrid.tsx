"use client";

import { useState } from "react";
import { AdminTerminCard, type AdminTerminCardProps } from "./AdminTerminCard";
import { TextMedium } from "@/components/ui/Typography";

export function AdminTerminiGrid({
  termini,
  pastTermini,
}: {
  termini: AdminTerminCardProps[];
  pastTermini: AdminTerminCardProps[];
}) {
  const [showPast, setShowPast] = useState(false);

  return (
    <div className="mt-16 grid grid-cols-2 gap-8">
      {termini.map((termin) => (
        <AdminTerminCard key={termin.id} {...termin} />
      ))}
      {showPast
        ? pastTermini.map((termin) => (
            <AdminTerminCard key={termin.id} {...termin} isPast />
          ))
        : (
            <div className="col-span-2 flex justify-center">
              <button
                type="button"
                onClick={() => setShowPast(true)}
                className="cursor-pointer hover:underline"
              >
                <TextMedium as="span">Pretekli termini</TextMedium>
              </button>
            </div>
          )}
    </div>
  );
}
