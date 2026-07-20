import { Heading1, TextBig } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { Breadcrumbs } from "./Breadcrumbs";

type Crumb = {
  label: string;
  href?: string;
  external?: boolean;
};

export function Hero({
  breadcrumbs,
  titlePrefix,
  titleHighlight,
  titleSuffix,
  description,
  accent = "primary",
}: {
  breadcrumbs?: Crumb[];
  titlePrefix?: string;
  titleHighlight: string;
  titleSuffix?: string;
  description: string;
  accent?: "primary" | "secondary";
}) {
  return (
    <div className="mx-auto mt-24 lg:mt-32 flex max-w-[680px] flex-col items-center gap-4 text-center">
      {breadcrumbs ? <Breadcrumbs items={breadcrumbs} className="justify-center" /> : null}
      <Heading1>
        {titlePrefix ? `${titlePrefix} ` : null}
        <span
          className={cn(
            "underline decoration-4 underline-offset-4",
            accent === "primary" ? "decoration-primary" : "decoration-secondary",
          )}
        >
          {titleHighlight}
        </span>
        {titleSuffix ? ` ${titleSuffix}` : null}
      </Heading1>
      <TextBig>{description}</TextBig>
    </div>
  );
}
