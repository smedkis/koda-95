import { Eyebrow, TextMedium } from "@/components/ui/Typography";

export function ConfirmationHelp() {
  return (
    <div className="mx-auto mt-16 max-w-[680px] text-center">
      <Eyebrow>Potrebujete pomoč?</Eyebrow>
      <a href="mailto:koda95@tahograficuderman.si" className="mt-6 block hover:underline">
        <TextMedium>koda95@tahograficuderman.si</TextMedium>
      </a>
    </div>
  );
}
