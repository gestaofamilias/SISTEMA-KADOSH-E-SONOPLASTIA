"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { buildScheduleMessage, buildTechnicalScheduleMessage, formatDateBadge, formatTime } from "@/lib/utils";

export async function getN8nWebhookUrl() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_settings")
    .select("setting_value")
    .eq("setting_key", "n8n_webhook_url")
    .maybeSingle();
  return data?.setting_value || process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "";
}

export async function setN8nWebhookUrl(formData: FormData) {
  const url = String(formData.get("webhook_url") ?? "").trim();
  const supabase = await createClient();
  const { error } = await supabase
    .from("app_settings")
    .upsert({ setting_key: "n8n_webhook_url", setting_value: url }, { onConflict: "setting_key" });
  if (error) throw new Error(error.message);
  revalidatePath("/configuracoes");
  revalidatePath("/automacoes");
}

export async function sendScheduleToN8n(scheduleId: string) {
  const supabase = await createClient();

  const { data: schedule, error: scheduleError } = await supabase
    .from("schedules")
    .select("*, worship_events(*), schedule_members(*, team_members(*))")
    .eq("id", scheduleId)
    .single();
  if (scheduleError || !schedule) throw new Error(scheduleError?.message ?? "Escala não encontrada.");

  const { data: songs } = await supabase
    .from("weekly_songs")
    .select("*, team_members(full_name)")
    .eq("event_id", schedule.event_id)
    .order("song_order");

  const event = schedule.worship_events;
  const members = schedule.schedule_members as Array<{
    team_members: { id: string; full_name: string; phone: string };
    role: string;
    voice_type: string | null;
    instrument: string | null;
  }>;

  const dateLabel = formatDateBadge(event.event_date);
  const timeLabel = formatTime(event.event_time);

  const singers = members.filter((m) => m.role === "Cantor");
  const musicians = members.filter((m) => m.role === "Músico");
  const soundTech = members.find((m) => m.role === "Técnico de som");
  const datashowTech = members.find((m) => m.role === "Datashow");

  const songsForMessage = (songs ?? []).map((s) => ({
    order: s.song_order,
    name: s.song_name,
    keyTone: s.key_tone,
    leadName: (s as unknown as { team_members?: { full_name: string } }).team_members?.full_name,
  }));

  const message = buildScheduleMessage({
    eventName: event.name,
    dateLabel,
    timeLabel,
    singers: singers.map((m) => ({ name: m.team_members.full_name, detail: m.voice_type })),
    musicians: musicians.map((m) => ({ name: m.team_members.full_name, detail: m.instrument })),
    soundTech: soundTech?.team_members.full_name,
    datashowTech: datashowTech?.team_members.full_name,
    songs: songsForMessage,
    notes: schedule.general_notes,
  });

  const payload = {
    tipo: "escala_completa",
    culto: {
      id: event.id,
      nome: event.name,
      data: event.event_date,
      horario: event.event_time,
      dia_semana: event.weekday,
    },
    escala: {
      id: schedule.id,
      status: schedule.status,
      observacoes: schedule.general_notes,
      observacoes_tecnicas: schedule.technical_notes,
    },
    pessoas: members.map((m) => ({
      member_id: m.team_members.id,
      nome: m.team_members.full_name,
      telefone: m.team_members.phone,
      funcao: m.role,
      tipo_voz: m.voice_type,
      instrumento: m.instrument,
      status_confirmacao: "Pendente",
    })),
    hinos: (songs ?? []).map((s) => ({
      ordem: s.song_order,
      nome: s.song_name,
      tom: s.key_tone,
      quem_puxa: (s as unknown as { team_members?: { full_name: string } }).team_members?.full_name ?? null,
    })),
    mensagem: message,
  };

  const webhookUrl = await getN8nWebhookUrl();

  let status: "Enviado" | "Erro" = "Erro";
  let responseText: string | null = null;
  let errorMessage: string | null = null;

  if (!webhookUrl) {
    errorMessage = "Nenhuma URL de webhook do n8n configurada em Configurações.";
  } else {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      responseText = await res.text().catch(() => null);
      status = res.ok ? "Enviado" : "Erro";
      if (!res.ok) errorMessage = `Webhook respondeu com status ${res.status}`;
    } catch (e) {
      errorMessage = e instanceof Error ? e.message : "Falha ao chamar o webhook.";
    }
  }

  await supabase.from("automation_logs").insert({
    schedule_id: scheduleId,
    automation_type: "n8n_webhook",
    webhook_url: webhookUrl || null,
    payload,
    status,
    response: responseText,
    error_message: errorMessage,
  });

  const now = new Date().toISOString();
  await supabase.from("confirmation_logs").insert(
    members.map((m) => ({
      schedule_id: scheduleId,
      member_id: m.team_members.id,
      phone: m.team_members.phone,
      message_sent: message,
      confirmation_status: "Pendente",
      sent_at: now,
    }))
  );

  await supabase
    .from("schedules")
    .update({
      whatsapp_message: message,
      n8n_sent: status === "Enviado",
      confirmation_requested: true,
      status: schedule.status === "Rascunho" ? "Aguardando confirmação" : schedule.status,
    })
    .eq("id", scheduleId);

  if (schedule.status === "Rascunho") {
    await supabase
      .from("worship_events")
      .update({ status: "Aguardando confirmação" })
      .eq("id", schedule.event_id);
  }

  revalidatePath(`/escalas/${scheduleId}`);
  revalidatePath("/automacoes");
  revalidatePath("/historico");
  revalidatePath("/dashboard");

  if (status === "Erro") throw new Error(errorMessage ?? "Erro ao enviar para o n8n.");

  return { message };
}

export async function sendTechnicalScheduleToN8n(scheduleId: string) {
  const supabase = await createClient();

  const { data: schedule, error: scheduleError } = await supabase
    .from("schedules")
    .select("*, worship_events(*), schedule_members(*, team_members(*))")
    .eq("id", scheduleId)
    .single();
  if (scheduleError || !schedule) throw new Error(scheduleError?.message ?? "Escala não encontrada.");

  const { data: songs } = await supabase
    .from("weekly_songs")
    .select("*, team_members(full_name)")
    .eq("event_id", schedule.event_id)
    .order("song_order");

  const event = schedule.worship_events;
  const members = (schedule.schedule_members as Array<{
    team_members: { id: string; full_name: string; phone: string };
    role: string;
    voice_type: string | null;
    instrument: string | null;
  }>).filter((m) => m.role === "Técnico de som" || m.role === "Datashow");

  if (members.length === 0) {
    throw new Error("Nenhum técnico (Som/Datashow) escalado nesta escala.");
  }

  const dateLabel = formatDateBadge(event.event_date);
  const timeLabel = formatTime(event.event_time);

  const soundTech = members.find((m) => m.role === "Técnico de som");
  const datashowTech = members.find((m) => m.role === "Datashow");

  const songsForMessage = (songs ?? []).map((s) => ({
    order: s.song_order,
    name: s.song_name,
    keyTone: s.key_tone,
    leadName: (s as unknown as { team_members?: { full_name: string } }).team_members?.full_name,
  }));

  const message = buildTechnicalScheduleMessage({
    eventName: event.name,
    dateLabel,
    timeLabel,
    soundTech: soundTech?.team_members.full_name,
    datashowTech: datashowTech?.team_members.full_name,
    songs: songsForMessage,
    technicalNotes: schedule.technical_notes,
  });

  const payload = {
    tipo: "escala_tecnica",
    culto: {
      id: event.id,
      nome: event.name,
      data: event.event_date,
      horario: event.event_time,
      dia_semana: event.weekday,
    },
    escala: {
      id: schedule.id,
      status: schedule.status,
      observacoes_tecnicas: schedule.technical_notes,
    },
    tecnica: members.map((m) => ({
      member_id: m.team_members.id,
      nome: m.team_members.full_name,
      telefone: m.team_members.phone,
      funcao: m.role,
      status_confirmacao: "Pendente",
    })),
    mensagem: message,
  };

  const webhookUrl = await getN8nWebhookUrl();

  let status: "Enviado" | "Erro" = "Erro";
  let responseText: string | null = null;
  let errorMessage: string | null = null;

  if (!webhookUrl) {
    errorMessage = "Nenhuma URL de webhook do n8n configurada em Configurações.";
  } else {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      responseText = await res.text().catch(() => null);
      status = res.ok ? "Enviado" : "Erro";
      if (!res.ok) errorMessage = `Webhook respondeu com status ${res.status}`;
    } catch (e) {
      errorMessage = e instanceof Error ? e.message : "Falha ao chamar o webhook.";
    }
  }

  await supabase.from("automation_logs").insert({
    schedule_id: scheduleId,
    automation_type: "n8n_webhook_technical",
    webhook_url: webhookUrl || null,
    payload,
    status,
    response: responseText,
    error_message: errorMessage,
  });

  const now = new Date().toISOString();
  await supabase.from("confirmation_logs").insert(
    members.map((m) => ({
      schedule_id: scheduleId,
      member_id: m.team_members.id,
      phone: m.team_members.phone,
      message_sent: message,
      confirmation_status: "Pendente",
      sent_at: now,
    }))
  );

  await supabase
    .from("schedules")
    .update({
      confirmation_requested: true,
    })
    .eq("id", scheduleId);

  revalidatePath(`/escalas/${scheduleId}`);
  revalidatePath("/sonoplastia");
  revalidatePath("/automacoes");
  revalidatePath("/dashboard");

  if (status === "Erro") throw new Error(errorMessage ?? "Erro ao enviar para o n8n.");

  return { message };
}
