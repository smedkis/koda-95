import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Eyebrow, TextMedium, TextSmall } from "./Typography";

type RadioProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  labelSize?: "sm" | "md" | "eyebrow";
};

const LABEL_COMPONENTS = {
  sm: TextSmall,
  md: TextMedium,
  eyebrow: Eyebrow,
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, labelSize = "md", className, required, ...props },
  ref,
) {
  const LabelText = LABEL_COMPONENTS[labelSize];
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2", className)}>
      <span className="relative inline-flex size-4 shrink-0">
        <input
          ref={ref}
          type="radio"
          required={required}
          className="peer absolute inset-0 z-10 size-full cursor-pointer opacity-0"
          {...props}
        />
        <span className="pointer-events-none absolute inset-0 rounded-full border border-paragraph bg-white transition-colors peer-checked:border-secondary" />
        <span className="pointer-events-none absolute inset-0 m-auto size-2 scale-0 rounded-full bg-secondary-dark transition-transform peer-checked:scale-100" />
      </span>
      {label ? (
        <LabelText as="span" className="select-none">
          {label}
          {required ? " *" : ""}
        </LabelText>
      ) : null}
    </label>
  );
});
