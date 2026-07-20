"use server";

import { redirect } from "next/navigation";
import { deleteNarocnik } from "@/lib/data/narocniki";

export async function unsubscribeNarocnik(formData: FormData) {
  const id = formData.get("id");
  if (typeof id === "string" && id) {
    await deleteNarocnik(id);
  }
  redirect("/odjava?done=1");
}
