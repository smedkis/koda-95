import { Container } from "@/components/ui/Container";
import { AboutSection } from "@/components/site/AboutSection";
import { FaqSection } from "@/components/site/FaqSection";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { LogosSection } from "@/components/site/LogosSection";
import { NumbersSection } from "@/components/site/NumbersSection";
import { SubscriptionSection } from "@/components/site/SubscriptionSection";
import { TerminiSection } from "@/components/site/TerminiSection";

// Placeholder data — will be replaced with a real Supabase query.
const PLACEHOLDER_TERMINI = [
  {
    title: "Redno usposabljanje Koda 95 (2026)",
    date: "Sreda, 20.05. 2026",
    address: "Pot za krajem 35, 4000 Kranj",
    timeRange: "15.00 - 21.00",
    attendeeCount: 16,
    capacity: 24,
    href: "/redna-koda-95/usposabljanje-2026-05-20",
  },
  {
    title: "Redno usposabljanje Koda 95 (2026)",
    date: "Sreda, 17.06. 2026",
    address: "Pot za krajem 35, 4000 Kranj",
    timeRange: "15.00 - 21.00",
    attendeeCount: 9,
    capacity: 24,
    href: "/redna-koda-95/usposabljanje-2026-06-17",
  },
  {
    title: "Redno usposabljanje Koda 95 (2026)",
    date: "Sreda, 15.07. 2026",
    address: "Pot za krajem 35, 4000 Kranj",
    timeRange: "15.00 - 21.00",
    attendeeCount: 22,
    capacity: 24,
    href: "/redna-koda-95/usposabljanje-2026-07-15",
  },
  {
    title: "Redno usposabljanje Koda 95 (2026)",
    date: "Sreda, 19.08. 2026",
    address: "Pot za krajem 35, 4000 Kranj",
    timeRange: "15.00 - 21.00",
    attendeeCount: 3,
    capacity: 24,
    href: "/redna-koda-95/usposabljanje-2026-08-19",
  },
];

const PLACEHOLDER_FAQ = [
  {
    question: "Kako pogosto moram opraviti usposabljanje Koda 95?",
    answer:
      "Redno usposabljanje Koda 95 je zakonsko obvezno vsakih 5 let za poklicne voznike s kategorijo C ali D.",
  },
  {
    question: "Kaj potrebujem za prijavo na termin?",
    answer:
      "Za prijavo potrebujete osebne podatke, veljavno vozniško dovoljenje ustrezne kategorije in podatke za plačilo.",
  },
  {
    question: "Kako poteka plačilo usposabljanja?",
    answer: "Plačilo se izvede preko UPN QR kode, ki jo prejmete po oddaji prijave.",
  },
  {
    question: "Ali lahko usposabljanje plača podjetje namesto mene?",
    answer:
      "Da, pri prijavi lahko izberete, da plačilo izvede podjetje, in vnesete njegove podatke.",
  },
];

export default function RednaKoda95Page() {
  return (
    <Container>
      <Hero
        breadcrumbs={[
          { label: "Domov", href: "https://tahograficuderman.si", external: true },
          { label: "Redno usposabljanje" },
        ]}
        title="Prijava na redno usposabljanje Koda 95"
        description="Ste poklicni voznik s kategorijo C ali D? Redno usposabljanje za podaljšanje kode 95 (TKV) je zakonsko obvezno vsakih 5 let. Pri Tahografi Cuderman organiziramo usposabljanja skozi vse leto. Izberite termin, ki vam ustreza, in se prijavite preko obrazca."
      />
      <TerminiSection termini={PLACEHOLDER_TERMINI} />
      <LogosSection />
      <FaqSection faqs={PLACEHOLDER_FAQ} />
      <AboutSection />
      <NumbersSection />
      <SubscriptionSection />
      <Footer />
    </Container>
  );
}
