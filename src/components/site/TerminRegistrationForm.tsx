import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";

export function TerminRegistrationForm() {
  return (
    <Box className="flex flex-col">
      <Input
        label="Ime in priimek"
        placeholder="Ime in priimek"
        name="fullName"
        required
      />
      <Input
        label="E-poštni naslov"
        placeholder="E-poštni naslov"
        name="email"
        type="email"
        required
        className="mt-6"
      />
      <Input
        label="Telefonska številka"
        placeholder="Telefonska številka"
        name="phone"
        type="tel"
        required
        className="mt-6"
      />
      <Checkbox
        name="consentMarketing"
        label="Želim prejemati obvestila Kode 95 na tel. številko in po elektronski pošti."
        className="mt-6"
      />
      <Checkbox
        name="consentTerms"
        required
        label="Strinjam se s splošnimi pogoji poslovanja in politiko zasebnosti."
        className="mt-4"
      />
      <Button variant="secondary" className="mt-8 w-full">
        Prijavi se na termin
      </Button>
    </Box>
  );
}
