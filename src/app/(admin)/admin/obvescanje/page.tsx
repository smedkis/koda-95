import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Obveščanje | Koda 95 Admin",
  robots: { index: false, follow: false },
};

export default function ObvescanjeListPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2">
      <h1 className="text-2xl font-semibold">Obveščanje</h1>
      <p className="text-zinc-500">Registration/notification log — coming soon.</p>
    </div>
  );
}
