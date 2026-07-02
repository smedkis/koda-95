import { Eyebrow } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";

type Crumb = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <Eyebrow as="div" className="flex items-center justify-center gap-2">
      {items.map((item, index) => {
        const isActive = index === items.length - 1;
        return (
          <span key={item.label} className="flex items-center gap-2">
            {item.href ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {item.label}
              </a>
            ) : (
              <span className={cn(isActive && "text-primary")}>{item.label}</span>
            )}
            {index < items.length - 1 ? <span>/</span> : null}
          </span>
        );
      })}
    </Eyebrow>
  );
}
