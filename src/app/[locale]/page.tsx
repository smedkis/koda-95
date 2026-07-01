import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import {
  Eyebrow,
  Heading1,
  Heading2,
  Heading3,
  Text,
  TextBig,
  TextMedium,
} from "@/components/ui/Typography";

function BellIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-full">
      <path
        d="M8 1.5c-2 0-3.5 1.5-3.5 3.5v2.5L3 10h10l-1.5-2.5V5c0-2-1.5-3.5-3.5-3.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M6.5 12.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <Container className="flex flex-col gap-12 py-12">
      <div className="flex flex-col gap-2">
        <Eyebrow>Design sistem</Eyebrow>
        <Heading1>Koda 95</Heading1>
        <Heading2>Naslov ravni 2</Heading2>
        <Heading3>Naslov ravni 3</Heading3>
        <TextBig>Ovo je velik odstavek (paragraph big, medium).</TextBig>
        <Text>To je navaden odstavek (paragraph, regular).</Text>
        <TextMedium>To je odstavek srednje teže (paragraph, medium).</TextMedium>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button variant="primary">Primarni gumb</Button>
        <Button variant="secondary">Sekundarni gumb</Button>
        <Button variant="action" icon={<BellIcon />}>
          Akcijski gumb
        </Button>
        <Button variant="primary" disabled>
          Onemogočen
        </Button>
      </div>

      <Box className="flex max-w-md flex-col gap-4">
        <Heading3>Prijava na termin</Heading3>
        <Input placeholder="Ime in priimek" />
        <Input placeholder="E-poštni naslov" type="email" />
        <Input placeholder="Telefonska številka" type="tel" />
        <Checkbox label="Želim prejemati obvestila Kode 95 na tel. številko in po elektronski pošti." />
        <Checkbox label="Strinjam se s splošnimi pogoji poslovanja in politiko zasebnosti." />
        <Button variant="primary" className="self-start">
          Pošlji
        </Button>
      </Box>
    </Container>
  );
}
