import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Heading2, Text } from "@/components/ui/Typography";
import { unsubscribeNarocnik } from "./actions";

export default async function OdjavaPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; done?: string }>;
}) {
  const { id, done } = await searchParams;

  return (
    <div className="w-full max-w-[420px] text-center">
      <Box className="bg-white">
        {done ? (
          <>
            <Heading2>Odjava uspešna</Heading2>
            <Text className="mt-4">
              Uspešno ste se odjavili od prejemanja obvestil o terminih usposabljanja Koda 95.
            </Text>
          </>
        ) : id ? (
          <>
            <Heading2>Odjava od obvestil</Heading2>
            <Text className="mt-4">
              Ali se želite odjaviti od prejemanja obvestil o terminih usposabljanja Koda 95?
            </Text>
            <form action={unsubscribeNarocnik} className="mt-6">
              <input type="hidden" name="id" value={id} />
              <Button type="submit">Odjavi me</Button>
            </form>
          </>
        ) : (
          <>
            <Heading2>Neveljavna povezava</Heading2>
            <Text className="mt-4">Povezava za odjavo ni veljavna.</Text>
          </>
        )}
      </Box>
    </div>
  );
}
