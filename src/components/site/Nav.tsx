import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
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
            className="h-12 w-auto"
            priority
          />
        </Link>
        <NavLinks />
        <LanguageSwitcher />
      </Container>
    </div>
  );
}
