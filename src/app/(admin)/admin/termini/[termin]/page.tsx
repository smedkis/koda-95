import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AdminTerminDriversTable,
  type TerminDriver,
} from "@/components/admin/AdminTerminDriversTable";
import { Button } from "@/components/ui/Button";
import { Heading2, Heading3, Text, TextMedium } from "@/components/ui/Typography";
import { PLACEHOLDER_PAST_TERMINI, PLACEHOLDER_TERMINI } from "../page";

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-3.5 shrink-0">
      <path d="M5.09976 12L19.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
      <path
        d="M10.5498 18.0246L4.4998 12.0006L10.5498 5.97559"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

// Placeholder data — will be replaced with a real Supabase query filtered
// by the termin id. Respects the rule that a missing form always implies
// payment status "čaka" (a driver can't have paid or been sent a payment
// before they've even filled out the registration form).
const PLACEHOLDER_DRIVERS: TerminDriver[] = [
  {
    id: "1",
    driverName: "Janez Novak",
    category: "C",
    formStatus: "izpolnjen",
    paymentStatus: "poravnano",
    payer: "sam",
  },
  {
    id: "2",
    driverName: "Ana Kovač",
    category: "D",
    formStatus: "izpolnjen",
    paymentStatus: "poslano",
    payer: "Kobal d.o.o.",
  },
  {
    id: "3",
    driverName: "Marko Zupan",
    category: "C+D",
    formStatus: "manjka",
    paymentStatus: "caka",
    payer: "sam",
  },
  {
    id: "4",
    driverName: "Petra Horvat",
    category: "C",
    formStatus: "izpolnjen",
    paymentStatus: "poravnano",
    payer: "Arriva",
  },
  {
    id: "5",
    driverName: "Luka Bregar",
    category: "D",
    formStatus: "izpolnjen",
    paymentStatus: "caka",
    payer: "sam",
  },
  {
    id: "6",
    driverName: "Nina Potočnik",
    category: "C",
    formStatus: "manjka",
    paymentStatus: "caka",
    payer: "sam",
  },
  {
    id: "7",
    driverName: "Rok Kranjc",
    category: "C+D",
    formStatus: "izpolnjen",
    paymentStatus: "poslano",
    payer: "Jurenič Transport",
  },
  {
    id: "8",
    driverName: "Maja Vidmar",
    category: "D",
    formStatus: "izpolnjen",
    paymentStatus: "poravnano",
    payer: "sam",
  },
];

function getTermin(id: string) {
  return (
    PLACEHOLDER_TERMINI.find((entry) => entry.id === id) ??
    PLACEHOLDER_PAST_TERMINI.find((entry) => entry.id === id) ??
    null
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ termin: string }>;
}): Promise<Metadata> {
  const { termin: id } = await params;
  const termin = getTermin(id);
  if (!termin) return {};
  return {
    title: `${termin.title} | Koda 95 Admin`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminTerminDetailPage({
  params,
}: {
  params: Promise<{ termin: string }>;
}) {
  const { termin: id } = await params;
  const termin = getTermin(id);
  if (!termin) notFound();

  return (
    <div className="mt-32 mb-32">
      <Link
        href="/admin/termini"
        className="inline-flex items-center gap-1.5 text-placeholder hover:text-paragraph hover:underline"
      >
        <ArrowLeftIcon />
        <TextMedium as="span" className="text-inherit">
          Termini
        </TextMedium>
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <Heading2>{termin.title}</Heading2>
        <Button
          type="button"
          variant="primary"
          icon={<Image src="/Edit-white.svg" alt="" width={16} height={16} />}
        >
          Uredi
        </Button>
      </div>
      <div className="mt-4 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Image src="/icon-calendar.svg" alt="" width={20} height={20} className="size-5" />
          <Text>{termin.date}</Text>
        </div>
        <div className="flex items-center gap-2">
          <Image src="/icon-clock.svg" alt="" width={20} height={20} className="size-5" />
          <Text>{termin.timeRange}</Text>
        </div>
        <div className="flex items-center gap-2">
          <Image src="/icon-location.svg" alt="" width={20} height={20} className="size-5" />
          <Text>{termin.address}</Text>
        </div>
      </div>
      <div className="mt-16 flex items-center justify-between">
        <Heading3>Prijavljeni vozniki</Heading3>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="action"
            icon={<Image src="/plus.svg" alt="" width={13} height={13} />}
          >
            Dodaj
          </Button>
          <Button
            type="button"
            variant="action"
            icon={<Image src="/icon-print.svg" alt="" width={16} height={16} />}
          >
            Izvoz
          </Button>
        </div>
      </div>
      <div className="mt-6">
        <AdminTerminDriversTable drivers={PLACEHOLDER_DRIVERS} />
      </div>
    </div>
  );
}
