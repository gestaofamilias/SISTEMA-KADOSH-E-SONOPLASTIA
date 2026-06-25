import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

const CONFIRMED_WORDS = ["confirmado", "confirmo", "sim", "ok", "estarei"];
const DECLINED_WORDS = ["não", "nao", "não posso", "nao posso", "recusado"];

function interpretResponse(resposta: string, fallback: "Pendente" | "Confirmado" | "Recusado") {
  const normalized = resposta.trim().toLowerCase();
  if (CONFIRMED_WORDS.some((w) => normalized === w || normalized.includes(w))) return "Confirmado";
  if (DECLINED_WORDS.some((w) => normalized === w || normalized.includes(w))) return "Recusado";
  return fallback;
}

export async function POST(request: NextRequest) {
  const secret = process.env.N8N_CONFIRMATION_SECRET;
  const headerSecret = request.headers.get("x-kadosh-secret");

  if (!secret || !headerSecret || headerSecret !== secret) {
    return NextResponse.json({ error: "Não autorizado: token inválido." }, { status: 401 });
  }

  let body: {
    schedule_id?: string;
    member_id?: string;
    telefone?: string;
    resposta?: string;
    mensagem_recebida?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { schedule_id, member_id, telefone, resposta, mensagem_recebida } = body;

  if (!schedule_id || !member_id || !resposta) {
    return NextResponse.json(
      { error: "Campos obrigatórios ausentes: schedule_id, member_id, resposta." },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  const { data: scheduleMember, error: scheduleMemberError } = await supabase
    .from("schedule_members")
    .select("id, confirmation_status")
    .eq("schedule_id", schedule_id)
    .eq("member_id", member_id)
    .maybeSingle();

  if (scheduleMemberError) {
    return NextResponse.json({ error: scheduleMemberError.message }, { status: 500 });
  }
  if (!scheduleMember) {
    return NextResponse.json(
      { error: "Esta pessoa não está escalada nesta escala." },
      { status: 404 }
    );
  }

  const mappedStatus = interpretResponse(resposta, scheduleMember.confirmation_status);
  const now = new Date().toISOString();

  const { error: updateMemberError } = await supabase
    .from("schedule_members")
    .update({ confirmation_status: mappedStatus })
    .eq("id", scheduleMember.id);
  if (updateMemberError) {
    return NextResponse.json({ error: updateMemberError.message }, { status: 500 });
  }

  const { data: pendingLog } = await supabase
    .from("confirmation_logs")
    .select("id")
    .eq("schedule_id", schedule_id)
    .eq("member_id", member_id)
    .is("responded_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (pendingLog) {
    await supabase
      .from("confirmation_logs")
      .update({
        confirmation_status: mappedStatus,
        response_text: mensagem_recebida ?? resposta,
        responded_at: now,
      })
      .eq("id", pendingLog.id);
  } else {
    await supabase.from("confirmation_logs").insert({
      schedule_id,
      member_id,
      phone: telefone ?? null,
      confirmation_status: mappedStatus,
      response_text: mensagem_recebida ?? resposta,
      sent_at: now,
      responded_at: now,
    });
  }

  const { data: allMembers } = await supabase
    .from("schedule_members")
    .select("confirmation_status")
    .eq("schedule_id", schedule_id);

  if (allMembers && allMembers.length > 0 && allMembers.every((m) => m.confirmation_status === "Confirmado")) {
    await supabase.from("schedules").update({ status: "Confirmada" }).eq("id", schedule_id);
  }

  return NextResponse.json({ ok: true, confirmation_status: mappedStatus });
}
