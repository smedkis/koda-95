import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "action";

// Hover shades are each variant's own color darkened ~15% — a filter-based
// hover:brightness-90 also dims the (often white) text/icon along with the
// background, which reads as muddy rather than as a pressed-state darken.
const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white px-[14px] py-[10px] hover:bg-[#d06e1b]",
  secondary: "bg-secondary text-paragraph px-[14px] py-[10px] hover:bg-[#2db896]",
  action: "bg-paragraph text-white px-[10px] py-[6px] hover:bg-[#36272b]",
};

const baseClasses =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded font-body text-[16px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed";

function ButtonIcon({ icon }: { icon?: ReactNode }) {
  if (!icon) return null;
  return <span className="flex size-4 shrink-0 items-center justify-center">{icon}</span>;
}

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
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      <ButtonIcon icon={icon} />
      {children}
    </button>
  );
}

// Same visual styling as Button, but renders as an internal (locale-aware)
// link — for CTAs that navigate rather than submit/act.
type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
};

export function ButtonLink({
  variant = "primary",
  icon,
  children,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={cn(baseClasses, variantClasses[variant], className)} {...props}>
      <ButtonIcon icon={icon} />
      {children}
    </Link>
  );
}
