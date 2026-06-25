"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const songSchema = z.object({
  event_id: z.string().uuid(),
  schedule_id: z.string().uuid().optional().nullable(),
  song_order: z.coerce.number().int().min(1),
  song_name: z.string().min(1, "Informe o nome do hino"),
  key_tone: z.string().optional().nullable(),
  lead_member_id: z.string().uuid().optional().nullable().or(z.literal("")),
  singer_notes: z.string().optional().nullable(),
  musician_notes: z.string().optional().nullable(),
  datashow_notes: z.string().optional().nullable(),
});

function parseSongForm(formData: FormData) {
  const parsed = songSchema.parse({
    event_id: formData.get("event_id"),
    schedule_id: formData.get("schedule_id") || null,
    song_order: formData.get("song_order"),
    song_name: formData.get("song_name"),
    key_tone: formData.get("key_tone") || null,
    lead_member_id: formData.get("lead_member_id") || null,
    singer_notes: formData.get("singer_notes") || null,
    musician_notes: formData.get("musician_notes") || null,
    datashow_notes: formData.get("datashow_notes") || null,
  });
  return { ...parsed, lead_member_id: parsed.lead_member_id || null };
}

export async function createSong(formData: FormData) {
  const data = parseSongForm(formData);
  const supabase = await createClient();
  const { error } = await supabase.from("weekly_songs").insert(data);
  if (error) throw new Error(error.message);
  revalidatePath("/hinos-da-semana");
  if (data.schedule_id) revalidatePath(`/escalas/${data.schedule_id}`);
  revalidatePath("/dashboard");
}

export async function updateSong(id: string, formData: FormData) {
  const data = parseSongForm(formData);
  const supabase = await createClient();
  const { error } = await supabase.from("weekly_songs").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/hinos-da-semana");
  if (data.schedule_id) revalidatePath(`/escalas/${data.schedule_id}`);
  revalidatePath("/dashboard");
}

export async function deleteSong(id: string, scheduleId?: string | null) {
  const supabase = await createClient();
  const { error } = await supabase.from("weekly_songs").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/hinos-da-semana");
  if (scheduleId) revalidatePath(`/escalas/${scheduleId}`);
  revalidatePath("/dashboard");
}
