import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="text-zinc-500">{t("description")}</p>
    </div>
  );
}
