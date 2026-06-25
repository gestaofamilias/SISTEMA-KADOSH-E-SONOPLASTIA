"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  CONFIRMATION_STATUSES,
  INSTRUMENTS,
  MAIN_ROLES,
  PRESENCE_STATUSES,
  SCHEDULE_STATUSES,
  VOICE_TYPES,
} from "@/lib/constants";

const newScheduleSchema = z.object({
  event_id: z.string().uuid("Selecione um culto"),
  general_notes: z.string().optional().nullable(),
  status: z.enum(SCHEDULE_STATUSES as [string, ...string[]]),
});

export async function createSchedule(formData: FormData) {
  const data = newScheduleSchema.parse({
    event_id: formData.get("event_id"),
    general_notes: formData.get("general_notes") || null,
    status: formData.get("status") || "Rascunho",
  });

  const supabase = await createClient();
  const { data: schedule, error } = await supabase
    .from("schedules")
    .insert(data)
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  await supabase
    .from("worship_events")
    .update({ status: "Escala em montagem" })
    .eq("id", data.event_id);

  revalidatePath("/escalas");
  revalidatePath("/cultos");
  revalidatePath("/dashboard");
  redirect(`/escalas/${schedule.id}`);
}

export async function updateScheduleMeta(id: string, formData: FormData) {
  const data = z
    .object({
      status: z.enum(SCHEDULE_STATUSES as [string, ...string[]]),
      general_notes: z.string().optional().nullable(),
    })
    .parse({
      status: formData.get("status"),
      general_notes: formData.get("general_notes") || null,
    });

  const supabase = await createClient();
  const { error } = await supabase.from("schedules").update(data).eq("id", id);
  if (error) throw new Error(error.message);

  const { data: schedule } = await supabase
    .from("schedules")
    .select("event_id")
    .eq("id", id)
    .single();

  if (schedule) {
    const eventStatusMap: Record<string, string> = {
      Rascunho: "Escala em montagem",
      "Aguardando confirmação": "Aguardando confirmação",
      Confirmada: "Confirmado",
      Realizada: "Realizado",
      Cancelada: "Cancelado",
    };
    await supabase
      .from("worship_events")
      .update({ status: eventStatusMap[data.status] ?? "Planejado" })
      .eq("id", schedule.event_id);
  }

  revalidatePath(`/escalas/${id}`);
  revalidatePath("/escalas");
  revalidatePath("/cultos");
  revalidatePath("/dashboard");
}

export async function deleteSchedule(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("schedules").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/escalas");
  revalidatePath("/dashboard");
  redirect("/escalas");
}

const scheduleMemberSchema = z.object({
  member_id: z.string().uuid("Selecione uma pessoa"),
  role: z.enum(MAIN_ROLES as [string, ...string[]]),
  voice_type: z.enum(VOICE_TYPES as [string, ...string[]]).optional().nullable(),
  instrument: z.enum(INSTRUMENTS as [string, ...string[]]).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function addScheduleMember(scheduleId: string, formData: FormData) {
  const data = scheduleMemberSchema.parse({
    member_id: formData.get("member_id"),
    role: formData.get("role"),
    voice_type: formData.get("voice_type") || null,
    instrument: formData.get("instrument") || null,
    notes: formData.get("notes") || null,
  });

  const supabase = await createClient();
  const { error } = await supabase.from("schedule_members").insert({
    schedule_id: scheduleId,
    ...data,
  });
  if (error) {
    if (error.code === "23505") throw new Error("Esta pessoa já está escalada nesta função.");
    throw new Error(error.message);
  }
  revalidatePath(`/escalas/${scheduleId}`);
  revalidatePath("/dashboard");
}

export async function updateScheduleMemberStatus(
  scheduleMemberId: string,
  scheduleId: string,
  formData: FormData
) {
  const data = z
    .object({
      confirmation_status: z.enum(CONFIRMATION_STATUSES as [string, ...string[]]),
      presence_status: z.enum(PRESENCE_STATUSES as [string, ...string[]]),
    })
    .parse({
      confirmation_status: formData.get("confirmation_status"),
      presence_status: formData.get("presence_status"),
    });

  const supabase = await createClient();
  const { error } = await supabase.from("schedule_members").update(data).eq("id", scheduleMemberId);
  if (error) throw new Error(error.message);
  revalidatePath(`/escalas/${scheduleId}`);
  revalidatePath("/historico");
}

export async function removeScheduleMember(scheduleMemberId: string, scheduleId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("schedule_members").delete().eq("id", scheduleMemberId);
  if (error) throw new Error(error.message);
  revalidatePath(`/escalas/${scheduleId}`);
  revalidatePath("/dashboard");
}

export async function saveScheduleMessage(scheduleId: string, message: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("schedules")
    .update({ whatsapp_message: message })
    .eq("id", scheduleId);
  if (error) throw new Error(error.message);
  revalidatePath(`/escalas/${scheduleId}`);
}
