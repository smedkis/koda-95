import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Eyebrow } from "./Typography";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, label, required, placeholder, children, ...props },
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
      <select
        ref={ref}
        required={required}
        className={cn(
          "w-full rounded border border-divider bg-white px-[14px] py-[10px]",
          "font-body text-[16px] text-paragraph",
          "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled className="text-placeholder">
            {placeholder}
          </option>
        ) : null}
        {children}
      </select>
    </label>
  );
});
