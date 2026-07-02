import Image from "next/image";
import { Eyebrow, TextMedium } from "@/components/ui/Typography";

export function ContactMethod({
  icon,
  label,
  value,
  href,
}: {
  icon: string;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Image src={icon} alt="" width={24} height={24} className="size-6" />
        <Eyebrow>{label}</Eyebrow>
      </div>
      <a href={href} className="hover:underline">
        <TextMedium>{value}</TextMedium>
      </a>
    </div>
  );
}
