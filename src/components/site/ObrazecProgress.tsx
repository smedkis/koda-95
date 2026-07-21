"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";

export function ObrazecProgress({ step, totalSteps = 3 }: { step: number; totalSteps?: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Start at 0 on mount, then animate to the target width on the next
    // frame so the fill visibly grows in rather than jumping straight there.
    const frame = requestAnimationFrame(() => setWidth((step / totalSteps) * 100));
    return () => cancelAnimationFrame(frame);
  }, [step, totalSteps]);

  return (
    <Container>
      <div className="-mx-8 h-2 overflow-hidden bg-divider">
        <div
          className="h-full bg-secondary transition-all duration-700 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
    </Container>
  );
}
