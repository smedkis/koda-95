import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Eyebrow, Heading2 } from "@/components/ui/Typography";

// Breaks out to the full viewport width for the background/stroke while
// staying nested inside the page's single Container, so the container's
// left/right border lines stay continuous instead of stopping here.
export function SubscriptionSection() {
  return (
    <div className="mt-32 w-screen border-y border-divider ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]">
      <div className="mx-auto max-w-[1224px] border-x border-container-border bg-secondary-bg px-8">
        <div className="grid grid-cols-2 items-center gap-16 py-16">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Image src="/bell.svg" alt="" width={24} height={24} className="size-6" />
              <Eyebrow className="text-primary">Nastavite opomnik</Eyebrow>
            </div>
            <Heading2>Ne zamudite naslednjih terminov usposabljanja.</Heading2>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <Input type="email" placeholder="E-poštni naslov" className="w-72" />
              <Button variant="secondary">Prijavi se</Button>
            </div>
            <Checkbox label="Strinjam se s splošnimi pogoji poslovanja in politiko zasebnosti." />
          </div>
        </div>
      </div>
    </div>
  );
}
