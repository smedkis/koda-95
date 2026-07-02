import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Eyebrow } from "./Typography";

// Focus ring color isn't part of the spec yet — using primary as a
// placeholder until confirmed.
type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, required, ...props },
  ref,
) {
  return (
    <label className={cn("block", className)}>
      {label ? (
        <Eyebrow className="mb-2">
          {label}
          {required ? " *" : ""}
        </Eyebrow>
      ) : null}
      <input
        ref={ref}
        required={required}
        className={cn(
          "w-full rounded border border-divider bg-white px-[14px] py-[10px]",
          "font-body text-[16px] text-paragraph placeholder-placeholder",
          "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        {...props}
      />
    </label>
  );
});
