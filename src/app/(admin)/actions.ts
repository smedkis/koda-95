"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, revokeSession } from "@/lib/admin-auth";
import { searchDrivers, type DriverSearchResult } from "@/lib/data/registrations";
import { OBVESCANJE_SEEN_COOKIE } from "@/lib/obvescanje-seen";

export async function searchDriversAction(query: string): Promise<DriverSearchResult[]> {
  return searchDrivers(query);
}

// Called on mount from the Obveščanje page — marks "now" as seen so the
// nav's unread badge resets until the next new registration comes in.
export async function markObvescanjeSeenAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(OBVESCANJE_SEEN_COOKIE, new Date().toISOString(), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function logout() {
  const cookieStore = await cookies();
  revokeSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  revalidatePath("/", "layout");
  redirect("/prijava");
}
