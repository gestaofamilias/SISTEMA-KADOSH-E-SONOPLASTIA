"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { EVENT_STATUSES, EVENT_TYPES, WEEKDAYS } from "@/lib/constants";

const eventSchema = z.object({
  name: z.string().min(2, "Informe o nome do culto"),
  weekday: z.enum(WEEKDAYS as [string, ...string[]]).optional().nullable(),
  event_date: z.string().min(1, "Informe a data"),
  event_time: z.string().min(1, "Informe o horário"),
  event_type: z.enum(EVENT_TYPES as [string, ...string[]]),
  status: z.enum(EVENT_STATUSES as [string, ...string[]]),
  notes: z.string().optional().nullable(),
});

function parseEventForm(formData: FormData) {
  return eventSchema.parse({
    name: formData.get("name"),
    weekday: formData.get("weekday") || null,
    event_date: formData.get("event_date"),
    event_time: formData.get("event_time"),
    event_type: formData.get("event_type"),
    status: formData.get("status"),
    notes: formData.get("notes") || null,
  });
}

export async function createEvent(formData: FormData) {
  const data = parseEventForm(formData);
  const supabase = await createClient();
  const { error } = await supabase.from("worship_events").insert(data);
  if (error) throw new Error(error.message);
  revalidatePath("/cultos");
  revalidatePath("/dashboard");
}

export async function updateEvent(id: string, formData: FormData) {
  const data = parseEventForm(formData);
  const supabase = await createClient();
  const { error } = await supabase.from("worship_events").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/cultos");
  revalidatePath("/dashboard");
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("worship_events").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/cultos");
  revalidatePath("/dashboard");
}
