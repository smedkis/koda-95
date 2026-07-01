import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

// Focus ring color isn't part of the spec yet — using primary as a
// placeholder until confirmed.
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded border border-divider bg-white px-[14px] py-[10px]",
          "font-body text-[16px] text-paragraph placeholder-placeholder",
          "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
