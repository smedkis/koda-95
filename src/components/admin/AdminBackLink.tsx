import Link from "next/link";
import { TextMedium } from "@/components/ui/Typography";

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-3.5 shrink-0">
      <path d="M5.09976 12L19.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
      <path
        d="M10.5498 18.0246L4.4998 12.0006L10.5498 5.97559"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function AdminBackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-placeholder hover:text-paragraph hover:underline"
    >
      <ArrowLeftIcon />
      <TextMedium as="span" className="text-inherit">
        {label}
      </TextMedium>
    </Link>
  );
}
