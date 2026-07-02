import { Eyebrow, Heading1, TextMedium } from "@/components/ui/Typography";

const NUMBERS = [
  { value: "37+", label: "Let delovanja" },
  { value: "3.000+", label: "Zadovoljnih strank" },
  { value: "11", label: "Izkušenih sodelavcev" },
  { value: "10.000+", label: "Opravljenih storitev" },
  { value: "100+", label: "Izšolanih tehnikov" },
];

export function NumbersSection() {
  return (
    <div className="mt-24 flex flex-col items-center">
      <Eyebrow>Naše podjetje v številkah</Eyebrow>
      <div className="mt-16 grid w-full grid-cols-5 gap-8">
        {NUMBERS.map((item) => (
          <div key={item.label} className="flex flex-col items-start gap-2 text-left">
            <Heading1 as="span" className="text-secondary-dark">
              {item.value}
            </Heading1>
            <TextMedium>{item.label}</TextMedium>
          </div>
        ))}
      </div>
    </div>
  );
}
