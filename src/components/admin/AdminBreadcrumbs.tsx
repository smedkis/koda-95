import Link from "next/link";
import { TextMedium } from "@/components/ui/Typography";

export type AdminBreadcrumbItem = { label: string; href?: string };

export function AdminBreadcrumbs({ items }: { items: AdminBreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1.5">
          {index > 0 ? (
            <TextMedium as="span" className="text-placeholder">
              /
            </TextMedium>
          ) : null}
          {item.href ? (
            <Link href={item.href} className="text-placeholder hover:text-paragraph hover:underline">
              <TextMedium as="span" className="text-inherit">
                {item.label}
              </TextMedium>
            </Link>
          ) : (
            <TextMedium as="span" className="text-paragraph">
              {item.label}
            </TextMedium>
          )}
        </span>
      ))}
    </nav>
  );
}
