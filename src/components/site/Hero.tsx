import { Heading1, TextBig } from "@/components/ui/Typography";
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
}: {
  breadcrumbs?: Crumb[];
  titlePrefix?: string;
  titleHighlight: string;
  titleSuffix?: string;
  description: string;
}) {
  return (
    <div className="mx-auto mt-24 lg:mt-32 flex max-w-[680px] flex-col items-center gap-4 text-center">
      {breadcrumbs ? <Breadcrumbs items={breadcrumbs} className="justify-center" /> : null}
      <Heading1>
        {titlePrefix ? `${titlePrefix} ` : null}
        <span className="relative inline-block">
          {titleHighlight}
          {/* Same orange gradient used on the "next termin" badge/border
              elsewhere, so this highlight ties into an existing motif
              instead of introducing a third accent treatment. */}
          <span
            className="absolute inset-x-0 -bottom-1 h-[3px] rounded-full sm:h-1.5"
            style={{ backgroundImage: "linear-gradient(90deg, #f58220, #ffab5c)" }}
          />
        </span>
        {titleSuffix ? ` ${titleSuffix}` : null}
      </Heading1>
      <TextBig>{description}</TextBig>
    </div>
  );
}
