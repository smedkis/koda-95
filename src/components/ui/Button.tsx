import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "action";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white px-[14px] py-[10px]",
  secondary: "bg-secondary text-paragraph px-[14px] py-[10px]",
  action: "bg-paragraph text-white px-[10px] py-[6px]",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
};

export function Button({
  variant = "primary",
  icon,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded font-body text-[16px] font-medium transition-colors",
        "hover:bg-black hover:text-white",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {icon ? <span className="size-4 shrink-0">{icon}</span> : null}
      {children}
    </button>
  );
}
