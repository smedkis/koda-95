import { Heading2, TextBig } from "@/components/ui/Typography";
import { ContactMethod } from "./ContactMethod";
import { FaqItem } from "./FaqItem";

export type FaqItemData = {
  question: string;
  answer: string;
};

export function FaqSection({ faqs }: { faqs: FaqItemData[] }) {
  return (
    <div className="mt-32 grid grid-cols-5 gap-24">
      <div className="col-span-2 flex flex-col">
        <Heading2>Pogosto zastavljena vprašanja</Heading2>
        <TextBig className="mt-4">
          Preberite si pogosta vprašanja o Kodi 95. Če imate dodatna vprašanja, nas
          kontaktirajte. Z veseljem vam bomo pomagali.
        </TextBig>
        <div className="mt-8 grid grid-cols-2 gap-8">
          <ContactMethod
            icon="/icon-call.svg"
            label="Pokličite nas"
            value="+386 41 433 825"
            href="tel:+38641433825"
          />
          <ContactMethod
            icon="/icon-message.svg"
            label="Pišite nam"
            value="koda95@tahograficuderman.si"
            href="mailto:koda95@tahograficuderman.si"
          />
        </div>
      </div>
      <div className="col-span-3 flex flex-col gap-4">
        {faqs.map((item) => (
          <FaqItem key={item.question} question={item.question} answer={item.answer} />
        ))}
      </div>
    </div>
  );
}
