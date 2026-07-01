import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// Used for termin/signup cards.
export function Box({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-divider bg-secondary-bg p-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
