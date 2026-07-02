import { Heading1, TextBig } from "@/components/ui/Typography";
import { Breadcrumbs } from "./Breadcrumbs";

type Crumb = {
  label: string;
  href?: string;
};

export function Hero({
  breadcrumbs,
  title,
  description,
}: {
  breadcrumbs: Crumb[];
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto mt-32 flex max-w-[680px] flex-col items-center gap-4 text-center">
      <Breadcrumbs items={breadcrumbs} />
      <Heading1>{title}</Heading1>
      <TextBig>{description}</TextBig>
    </div>
  );
}
