import { Heading1, TextBig } from "@/components/ui/Typography";
import { Breadcrumbs } from "./Breadcrumbs";

type Crumb = {
  label: string;
  href?: string;
  external?: boolean;
};

export function Hero({
  breadcrumbs,
  title,
  description,
}: {
  breadcrumbs?: Crumb[];
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto mt-24 lg:mt-32 flex max-w-[680px] flex-col items-center gap-4 text-center">
      {breadcrumbs ? <Breadcrumbs items={breadcrumbs} className="justify-center" /> : null}
      <Heading1>{title}</Heading1>
      <TextBig>{description}</TextBig>
    </div>
  );
}
