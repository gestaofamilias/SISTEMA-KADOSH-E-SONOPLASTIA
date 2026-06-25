"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { USER_ROLES } from "@/lib/constants";

export async function updateUserRole(userId: string, formData: FormData) {
  const role = z.enum(USER_ROLES as [string, ...string[]]).parse(formData.get("role"));
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/configuracoes");
}
