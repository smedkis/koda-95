import Image from "next/image";
import { Heading2, Text } from "@/components/ui/Typography";

export function ConfirmationHeader() {
  return (
    <div className="mx-auto mt-32 max-w-[680px] text-center">
      <div className="flex items-center justify-center gap-4">
        <Image src="/kljukica.svg" alt="" width={40} height={40} className="shrink-0" />
        <Heading2>Vaša prijava je potrjena!</Heading2>
      </div>
      <Text className="mt-2">Poslali smo vam e-pošto z navodili za izpolnitev obrazca.</Text>
    </div>
  );
}
