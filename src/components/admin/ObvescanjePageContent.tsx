"use client";

import { useState } from "react";
import { ObvescanjeTable, type ObvescanjeEntry } from "./ObvescanjeTable";

export function ObvescanjePageContent({
  initialEntries,
}: {
  initialEntries: ObvescanjeEntry[];
}) {
  const [entries, setEntries] = useState(initialEntries);

  const handleDelete = (id: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  };

  return (
    <div className="mt-6">
      <ObvescanjeTable entries={entries} onDelete={handleDelete} />
    </div>
  );
}
