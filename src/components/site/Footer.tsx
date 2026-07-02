import { Text, TextMedium } from "@/components/ui/Typography";

export function Footer() {
  return (
    <div className="flex items-center justify-between py-6">
      <Text>Tahografi Cuderman d.o.o. ©2026</Text>
      <div className="flex items-center gap-4">
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
    </div>
  );
}
