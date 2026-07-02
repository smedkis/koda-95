import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { TextSmall } from "./Typography";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className, required, ...props },
  ref,
) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2", className)}>
      <span className="relative inline-flex size-4 shrink-0">
        <input
          ref={ref}
          type="checkbox"
          required={required}
          className="peer absolute inset-0 z-10 size-full cursor-pointer opacity-0"
          {...props}
        />
        <span className="pointer-events-none absolute inset-0 rounded border border-paragraph bg-white transition-colors peer-checked:bg-secondary" />
        <svg
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none relative z-[1] m-auto size-3 text-black opacity-0 transition-opacity peer-checked:opacity-100"
        >
          <path
            d="M3 8.5L6.5 12L13 4.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {label ? (
        <TextSmall as="span" className="select-none">
          {label}
          {required ? " *" : ""}
        </TextSmall>
      ) : null}
    </label>
  );
});
