export type UserRole = "Administrador" | "Líder Kadosh" | "Operador";

export type MainRole = "Cantor" | "Músico" | "Técnico de som" | "Datashow";

export type VoiceType =
  | "Melodia"
  | "Soprano"
  | "Contralto"
  | "Tenor"
  | "Baixo"
  | "Back vocal"
  | "Não se aplica";

export type Instrument =
  | "Violão"
  | "Guitarra"
  | "Teclado"
  | "Baixo"
  | "Bateria"
  | "Cajón"
  | "Saxofone"
  | "Outro"
  | "Não se aplica";

export type MemberStatus = "Ativo" | "Inativo" | "Indisponível temporariamente";

export type Weekday = "Quinta-feira" | "Sábado" | "Domingo" | "Outro";

export type EventType =
  | "Culto de Ensino"
  | "Culto de Louvor"
  | "Culto de Celebração"
  | "EBD"
  | "Ensaio"
  | "Evento especial"
  | "Outro";

export type EventStatus =
  | "Planejado"
  | "Escala em montagem"
  | "Aguardando confirmação"
  | "Confirmado"
  | "Realizado"
  | "Cancelado";

export type ScheduleStatus =
  | "Rascunho"
  | "Aguardando confirmação"
  | "Confirmada"
  | "Realizada"
  | "Cancelada";

export type ConfirmationStatus = "Pendente" | "Confirmado" | "Recusado" | "Substituído";

export type PresenceStatus = "Pendente" | "Presente" | "Ausente";

export type AutomationStatus = "Pendente" | "Enviado" | "Erro";

export type ChecklistStatus = "Pendente" | "Em andamento" | "Concluído" | "Com problema";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  member_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  full_name: string;
  phone: string;
  birthday: string | null;
  main_role: MainRole;
  secondary_roles: MainRole[];
  voice_type: VoiceType | null;
  instrument: Instrument | null;
  status: MemberStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorshipEvent {
  id: string;
  name: string;
  weekday: Weekday | null;
  event_date: string;
  event_time: string;
  event_type: EventType;
  status: EventStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  event_id: string;
  status: ScheduleStatus;
  general_notes: string | null;
  technical_notes: string | null;
  whatsapp_message: string | null;
  n8n_sent: boolean;
  confirmation_requested: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduleMember {
  id: string;
  schedule_id: string;
  member_id: string;
  role: MainRole;
  voice_type: VoiceType | null;
  instrument: Instrument | null;
  confirmation_status: ConfirmationStatus;
  presence_status: PresenceStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeeklySong {
  id: string;
  schedule_id: string | null;
  event_id: string;
  song_order: number;
  song_name: string;
  key_tone: string | null;
  lead_member_id: string | null;
  singer_notes: string | null;
  musician_notes: string | null;
  datashow_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConfirmationLog {
  id: string;
  schedule_id: string;
  member_id: string;
  phone: string | null;
  message_sent: string | null;
  confirmation_status: ConfirmationStatus;
  response_text: string | null;
  sent_at: string | null;
  responded_at: string | null;
  created_at: string;
}

export interface AutomationLog {
  id: string;
  schedule_id: string | null;
  automation_type: string;
  webhook_url: string | null;
  payload: Record<string, unknown> | null;
  status: AutomationStatus;
  response: string | null;
  error_message: string | null;
  created_at: string;
}

export interface AppSetting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  created_at: string;
  updated_at: string;
}

export interface TechnicalChecklist {
  id: string;
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
  created_at: string;
  updated_at: string;
}

