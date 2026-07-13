import { Suspense } from "react";
import { ObrazecForm } from "@/components/site/ObrazecForm";

export default function ObrazecPage() {
  return (
    <Suspense>
      <ObrazecForm />
    </Suspense>
  );
}
