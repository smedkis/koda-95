import { useTranslations } from "next-intl";
import { Heading2, TextBig } from "@/components/ui/Typography";
import { ContactMethod } from "./ContactMethod";
import { FaqItem } from "./FaqItem";

export type FaqItemData = {
  question: string;
  answer: string;
};

export function FaqSection({ faqs }: { faqs: FaqItemData[] }) {
  const t = useTranslations("Faq");
  return (
    <div className="mt-32 grid grid-cols-1 gap-12 lg:grid-cols-5 lg:gap-24">
      <div className="flex flex-col lg:col-span-2">
        <Heading2>{t("heading")}</Heading2>
        <TextBig className="mt-4">{t("intro")}</TextBig>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <ContactMethod
            icon="/icon-call.svg"
            label={t("callUs")}
            value="+386 41 433 825"
            href="tel:+38641433825"
          />
          <ContactMethod
            icon="/icon-message.svg"
            label={t("writeUs")}
            value="koda95@tahograficuderman.si"
            href="mailto:koda95@tahograficuderman.si"
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 lg:col-span-3">
        {faqs.map((item) => (
          <FaqItem key={item.question} question={item.question} answer={item.answer} />
        ))}
      </div>
    </div>
  );
}
