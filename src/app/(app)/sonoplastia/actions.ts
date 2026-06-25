"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ChecklistStatus } from "@/lib/database.types";

interface SaveChecklistData {
  id?: string;
  schedule_id: string;
  event_id: string;
  sound_checked: boolean;
  microphones_checked: boolean;
  datashow_checked: boolean;
  lyrics_ready: boolean;
  playback_checked: boolean;
  cables_checked: boolean;
  notes: string | null;
  status: ChecklistStatus;
}

export async function saveTechnicalChecklist(data: SaveChecklistData) {
  // Usa o client da sessão (não service_role): RLS de technical_checklists já
  // restringe escrita a Administrador/Líder Kadosh, mantendo Operador em modo
  // de visualização (a policy rejeita a escrita dele com um erro claro).
  const supabase = await createClient();

  const payload = {
    schedule_id: data.schedule_id,
    event_id: data.event_id,
    sound_checked: data.sound_checked,
    microphones_checked: data.microphones_checked,
    datashow_checked: data.datashow_checked,
    lyrics_ready: data.lyrics_ready,
    playback_checked: data.playback_checked,
    cables_checked: data.cables_checked,
    notes: data.notes || null,
    status: data.status,
  };

  let error;
  if (data.id) {
    const { error: err } = await supabase
      .from("technical_checklists")
      .update(payload)
      .eq("id", data.id);
    error = err;
  } else {
    const { error: err } = await supabase
      .from("technical_checklists")
      .upsert(payload, { onConflict: "schedule_id" });
    error = err;
  }

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/sonoplastia");
  revalidatePath(`/escalas/${data.schedule_id}`);
  revalidatePath("/dashboard");
}
