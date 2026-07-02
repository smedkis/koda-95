import { Eyebrow } from "@/components/ui/Typography";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

type Crumb = {
  label: string;
  href?: string;
  external?: boolean;
};

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <Eyebrow as="div" className={cn("flex min-w-0 items-center gap-2", className)}>
      {items.map((item, index) => {
        const isActive = index === items.length - 1;
        return (
          <span
            key={item.label}
            className={cn(
              "flex items-center gap-2",
              isActive ? "min-w-0" : "shrink-0 whitespace-nowrap",
            )}
          >
            {item.href ? (
              item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {item.label}
                </a>
              ) : (
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
              )
            ) : (
              <span className={cn(isActive && "truncate text-primary")}>{item.label}</span>
            )}
            {index < items.length - 1 ? <span className="shrink-0">/</span> : null}
          </span>
        );
      })}
    </Eyebrow>
  );
}
