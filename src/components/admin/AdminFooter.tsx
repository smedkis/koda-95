import { Container } from "@/components/ui/Container";
import { Text, TextMedium } from "@/components/ui/Typography";

export function AdminFooter() {
  return (
    <div className="w-screen border-t border-divider bg-white ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]">
      <Container className="flex flex-col items-start gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
        <Text>Tahografi Cuderman d.o.o. ©2026</Text>
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
          <a
            href="https://www.tahograficuderman.si/pogoji-poslovanja-in-politika-zasebnosti"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            <TextMedium>Pogoji poslovanja in politika zasebnosti</TextMedium>
          </a>
          <a
            href="https://gregacuderman.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            <TextMedium>Izdelal: Grega Cuderman</TextMedium>
          </a>
        </div>
      </Container>
    </div>
  );
}
