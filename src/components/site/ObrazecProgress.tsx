"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";

const TOTAL_STEPS = 3;

export function ObrazecProgress({ step }: { step: 1 | 2 | 3 }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Start at 0 on mount, then animate to the target width on the next
    // frame so the fill visibly grows in rather than jumping straight there.
    const frame = requestAnimationFrame(() => setWidth((step / TOTAL_STEPS) * 100));
    return () => cancelAnimationFrame(frame);
  }, [step]);

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
