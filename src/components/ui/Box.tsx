import type { CSSProperties, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

// Used for termin/signup cards.
export function Box({
  as: Tag = "div",
  children,
  className,
  style,
  ...rest
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
} & Record<string, unknown>) {
  return (
    <Tag
      className={cn(
        "rounded-lg border border-divider bg-secondary-bg p-8",
        className,
      )}
      style={style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
