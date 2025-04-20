"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { cookies } from "next/headers";

export async function AuthSignOut() {
  const cookieStore = await cookies();
  (await cookieStore.getAll()).forEach((cookie) => {
    cookieStore.delete(cookie.name);
  });

  revalidatePath("/auth/login");
  redirect(`/auth/login`);
}
