import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type TypographyProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
};

export function Heading1({ as: Tag = "h1", children, className }: TypographyProps) {
  return (
    <Tag
      className={cn(
        "font-heading text-[32px] leading-[40px] font-semibold text-heading sm:text-[48px] sm:leading-[58px]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function Heading2({ as: Tag = "h2", children, className }: TypographyProps) {
  return (
    <Tag
      className={cn(
        "font-heading text-[26px] leading-[34px] font-semibold text-heading sm:text-[36px] sm:leading-[46px]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function Heading3({ as: Tag = "h3", children, className }: TypographyProps) {
  return (
    <Tag
      className={cn(
        "font-heading text-[20px] leading-[28px] font-semibold text-heading sm:text-[24px] sm:leading-[34px]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

// Small uppercase title (client called it "small title", unsure if h4) — line
// height not specified, assumed same as body paragraph (24px) pending confirmation.
export function Eyebrow({ as: Tag = "p", children, className }: TypographyProps) {
  return (
    <Tag
      className={cn(
        "font-body text-[16px] leading-[24px] font-semibold uppercase text-heading",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function TextBig({ as: Tag = "p", children, className }: TypographyProps) {
  return (
    <Tag
      className={cn(
        "font-body text-[18px] leading-[26px] font-medium text-paragraph",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function Text({ as: Tag = "p", children, className }: TypographyProps) {
  return (
    <Tag
      className={cn(
        "font-body text-[16px] leading-[24px] font-normal text-paragraph",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function TextMedium({ as: Tag = "p", children, className }: TypographyProps) {
  return (
    <Tag
      className={cn(
        "font-body text-[16px] leading-[24px] font-medium text-paragraph",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

// Used next to 16x16 checkboxes. Line-height/weight not specified — assumed
// normal weight, 16px line-height, pending confirmation.
export function TextSmall({ as: Tag = "p", children, className }: TypographyProps) {
  return (
    <Tag
      className={cn(
        "font-body text-[12px] leading-[16px] font-normal text-paragraph",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
