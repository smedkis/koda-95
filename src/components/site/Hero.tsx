import Image from "next/image";
import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";
import { Heading1, TextBig } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { Breadcrumbs } from "./Breadcrumbs";
import { ProgramSwitch } from "./ProgramSwitch";

type Crumb = {
  label: string;
  href?: string;
  external?: boolean;
};

// Photo hero: the image spans the Container edge to edge (the negative
// margins cancel its px-4/sm:px-8 padding, so it meets the border lines) but
// never the full viewport. A dark overlay keeps the white copy readable —
// solid on phones where text covers the whole photo, a left-to-right
// gradient on desktop where the copy sits on the left and the people on the
// right stay visible.
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
  const t = useTranslations("Hero");

  return (
    <>
      <section className="relative -mx-4 flex min-h-[600px] items-center overflow-hidden sm:-mx-8 lg:min-h-[640px]">
        <Image
          src="/hero-usposabljanje.webp"
          alt={t("imageAlt")}
          fill
          priority
          sizes="(max-width: 1224px) 100vw, 1224px"
          className="max-w-none object-cover object-[65%_center]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-black/65 lg:bg-transparent lg:bg-linear-to-r lg:from-black/85 lg:via-black/60 lg:to-black/10"
        />
        <div className="relative flex max-w-[680px] flex-col items-start gap-5 px-4 py-16 sm:px-8 lg:px-14 lg:py-24">
          {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
          <span className="rounded-full bg-white/15 px-3 py-1.5 font-body text-[14px] font-semibold text-white">
            {t("badge")}
          </span>
          <Heading1 className="text-white">
            {titlePrefix ? `${titlePrefix} ` : null}
            <span
              className={cn(
                "underline decoration-4 underline-offset-4",
                accent === "primary"
                  ? "decoration-primary"
                  : "decoration-secondary",
              )}
            >
              {titleHighlight}
            </span>
            {titleSuffix ? ` ${titleSuffix}` : null}
          </Heading1>
          <TextBig className="text-white/90">{description}</TextBig>
          <div className="mt-2 flex flex-wrap gap-3">
            <ButtonLink href="#termini" variant="primary" className="px-6 py-3">
              {t("cta")}
            </ButtonLink>
            <a
              href="tel:+38641433825"
              className="inline-flex items-center justify-center rounded border border-white/60 px-6 py-3 font-body text-[16px] font-medium text-white transition-colors hover:bg-white/10"
            >
              {t("call")}
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-body text-[15px] text-white/90">
            <span>{t("rating")}</span>
            <span
              aria-hidden="true"
              className="hidden h-5 w-px bg-white/40 sm:block"
            />
            <span>{t("companies")}</span>
          </div>
        </div>
      </section>
      <div className="mt-10 flex justify-center">
        <ProgramSwitch />
      </div>
    </>
  );
}
