import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termini | Koda 95 Admin",
  robots: { index: false, follow: false },
};

export default function TerminiListPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-2xl font-semibold">Termini</h1>
      <p className="text-zinc-500">Admin termini list — coming soon.</p>
    </div>
  );
}
