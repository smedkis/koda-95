"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, revokeSession } from "@/lib/admin-auth";
import { searchDrivers, type DriverSearchResult } from "@/lib/data/registrations";

export async function searchDriversAction(query: string): Promise<DriverSearchResult[]> {
  return searchDrivers(query);
}

export async function logout() {
  const cookieStore = await cookies();
  await revokeSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  revalidatePath("/", "layout");
  redirect("/prijava");
}
