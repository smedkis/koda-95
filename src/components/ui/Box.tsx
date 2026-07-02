import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

// Used for termin/signup cards.
export function Box({
  as: Tag = "div",
  children,
  className,
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Tag
      className={cn(
        "rounded-lg border border-divider bg-secondary-bg p-8",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
