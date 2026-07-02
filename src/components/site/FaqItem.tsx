import { Box } from "@/components/ui/Box";
import { Text, TextMedium } from "@/components/ui/Typography";

export function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <Box as="details" className="group p-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6">
        <TextMedium as="span" className="font-semibold text-heading">
          {question}
        </TextMedium>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="size-4 shrink-0 transition-transform group-open:rotate-180"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </summary>
      <Text className="px-6 pb-6">{answer}</Text>
    </Box>
  );
}
