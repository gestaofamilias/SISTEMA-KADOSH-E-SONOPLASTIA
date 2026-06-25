"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { INSTRUMENTS, MAIN_ROLES, MEMBER_STATUSES, VOICE_TYPES } from "@/lib/constants";

const memberSchema = z.object({
  full_name: z.string().min(2, "Informe o nome completo"),
  phone: z.string().min(8, "Informe o telefone/WhatsApp"),
  birthday: z.string().optional().nullable(),
  main_role: z.enum(MAIN_ROLES as [string, ...string[]]),
  secondary_roles: z.array(z.enum(MAIN_ROLES as [string, ...string[]])).default([]),
  voice_type: z.enum(VOICE_TYPES as [string, ...string[]]).optional().nullable(),
  instrument: z.enum(INSTRUMENTS as [string, ...string[]]).optional().nullable(),
  status: z.enum(MEMBER_STATUSES as [string, ...string[]]),
  notes: z.string().optional().nullable(),
});

function parseMemberForm(formData: FormData) {
  const secondary = formData.getAll("secondary_roles").map(String);
  return memberSchema.parse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    birthday: formData.get("birthday") || null,
    main_role: formData.get("main_role"),
    secondary_roles: secondary.filter((r) => r !== formData.get("main_role")),
    voice_type: formData.get("voice_type") || null,
    instrument: formData.get("instrument") || null,
    status: formData.get("status"),
    notes: formData.get("notes") || null,
  });
}

export async function createMember(formData: FormData) {
  const data = parseMemberForm(formData);
  const supabase = await createClient();
  const { error } = await supabase.from("team_members").insert(data);
  if (error) throw new Error(error.message);
  revalidatePath("/equipe");
  revalidatePath("/dashboard");
  redirect("/equipe");
}

export async function updateMember(id: string, formData: FormData) {
  const data = parseMemberForm(formData);
  const supabase = await createClient();
  const { error } = await supabase.from("team_members").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/equipe");
  revalidatePath("/dashboard");
  redirect("/equipe");
}

export async function deleteMember(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/equipe");
  revalidatePath("/dashboard");
}
