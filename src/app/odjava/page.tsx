import { Box } from "@/components/ui/Box";
import { Heading2, Text } from "@/components/ui/Typography";
import { deleteNarocnik } from "@/lib/data/narocniki";

export default async function OdjavaPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (id) {
    await deleteNarocnik(id);
  }

  return (
    <div className="w-full max-w-[420px] text-center">
      <Box className="bg-white">
        <Heading2>Odjava uspešna</Heading2>
        <Text className="mt-4">
          Uspešno ste se odjavili od prejemanja obvestil o terminih usposabljanja Koda 95.
        </Text>
      </Box>
    </div>
  );
}
