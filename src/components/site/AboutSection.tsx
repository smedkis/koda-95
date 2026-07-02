import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Heading2, Text, TextBig } from "@/components/ui/Typography";

export function AboutSection() {
  return (
    <div className="mt-32 flex flex-col items-center">
      <div className="flex max-w-[680px] flex-col items-center text-center">
        <div className="flex items-center gap-2">
          <Image src="/google.svg" alt="Google" width={40} height={40} />
          <Image src="/stars.svg" alt="" width={101} height={17} />
          <Text className="font-semibold">4,9 (51 mnenj)</Text>
        </div>
        <Heading2 className="mt-4">Zakaj izbrati nas za usposabljanje Kode 95?</Heading2>
        <TextBig className="mt-4">
          Pri Tahografi Cuderman smo pooblaščen center za usposabljanje voznikov - Koda 95.
          Združujemo strokovno znanje, praktične izkušnje in razumevanje vozniškega poklica,
          zato vozniki od nas vedno odnesejo nekaj uporabnega.
        </TextBig>
        <ButtonLink href="#termini" variant="primary" className="mt-8">
          Izberite termin
        </ButtonLink>
      </div>
      <Image
        src="/about.webp"
        alt=""
        width={2000}
        height={900}
        className="mt-16 w-full"
      />
    </div>
  );
}
