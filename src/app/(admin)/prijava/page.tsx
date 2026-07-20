import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Heading2, Text } from "@/components/ui/Typography";
import {
  ADMIN_SESSION_COOKIE,
  clearLoginAttempts,
  createSession,
  isLoginRateLimited,
  recordFailedLogin,
  verifyCredentials,
} from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Prijava | Koda 95 Admin",
  robots: { index: false, follow: false },
};

async function getClientIdentifier() {
  const headerStore = await headers();
  return headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

async function login(formData: FormData) {
  "use server";

  const identifier = await getClientIdentifier();

  if (isLoginRateLimited(identifier)) {
    redirect("/prijava?error=ratelimited");
  }

  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!verifyCredentials(username, password)) {
    recordFailedLogin(identifier);
    redirect("/prijava?error=1");
  }

  clearLoginAttempts(identifier);

  const cookieStore = await cookies();
  const token = await createSession();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  // Every /admin/* page was cached client-side while still redirecting to
  // /prijava (unauthenticated) — without this, navigating there right after
  // login can render that stale cached content instead of the real page.
  revalidatePath("/", "layout");
  redirect("/admin/termini");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 py-16">
      <div className="max-w-[420px] text-center">
        <Heading2>Prijava Admin</Heading2>
        <Text className="mt-4">Prijava v portal za upravljanje terminov z Kodo 95</Text>
      </div>
      <form action={login} className="flex w-full max-w-[420px] flex-col">
        <Box className="flex flex-col gap-6 bg-white">
          <Input label="Uporabniško ime" placeholder="Uporabniško ime" name="username" />
          <Input label="Geslo" placeholder="Geslo" name="password" type="password" />
          {error === "ratelimited" ? (
            <Text className="text-primary">
              Preveč neuspešnih poskusov. Poskusite znova čez 15 minut.
            </Text>
          ) : error ? (
            <Text className="text-primary">Napačno uporabniško ime ali geslo.</Text>
          ) : null}
          <Button type="submit" variant="primary" className="w-full">
            Prijavi se
          </Button>
        </Box>
      </form>
    </div>
  );
}
