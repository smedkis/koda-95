import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileProgramToggle } from "./MobileProgramToggle";
import { NavLinks } from "./NavLinks";

export function Nav() {
  return (
    <div className="border-b border-divider print:border-t">
      <Container className="flex items-center justify-between py-6 print:justify-center">
        <Link href="/" className="shrink-0">
          <Image
            src="/logo.png"
            alt="Tahografi Cuderman"
            width={266}
            height={100}
            className="h-10 w-auto sm:h-12"
            priority
          />
        </Link>
        <NavLinks />
        <div className="flex items-center gap-3">
          <MobileProgramToggle />
          <LanguageSwitcher />
        </div>
      </Container>
    </div>
  );
}
