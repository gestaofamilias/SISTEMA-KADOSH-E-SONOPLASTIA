import type {
  ChecklistStatus,
  ConfirmationStatus,
  EventStatus,
  EventType,
  Instrument,
  MainRole,
  MemberStatus,
  PresenceStatus,
  ScheduleStatus,
  UserRole,
  VoiceType,
  Weekday,
} from "@/lib/database.types";

export const MAIN_ROLES: MainRole[] = ["Cantor", "Músico", "Técnico de som", "Datashow"];

export const VOICE_TYPES: VoiceType[] = [
  "Melodia",
  "Soprano",
  "Contralto",
  "Tenor",
  "Baixo",
  "Back vocal",
  "Não se aplica",
];

export const INSTRUMENTS: Instrument[] = [
  "Violão",
  "Guitarra",
  "Teclado",
  "Baixo",
  "Bateria",
  "Cajón",
  "Saxofone",
  "Outro",
  "Não se aplica",
];

export const MEMBER_STATUSES: MemberStatus[] = ["Ativo", "Inativo", "Indisponível temporariamente"];

export const WEEKDAYS: Weekday[] = ["Quinta-feira", "Sábado", "Domingo", "Outro"];

export const EVENT_TYPES: EventType[] = [
  "Culto de Ensino",
  "Culto de Louvor",
  "Culto de Celebração",
  "EBD",
  "Ensaio",
  "Evento especial",
  "Outro",
];

export const EVENT_STATUSES: EventStatus[] = [
  "Planejado",
  "Escala em montagem",
  "Aguardando confirmação",
  "Confirmado",
  "Realizado",
  "Cancelado",
];

export const SCHEDULE_STATUSES: ScheduleStatus[] = [
  "Rascunho",
  "Aguardando confirmação",
  "Confirmada",
  "Realizada",
  "Cancelada",
];

export const CONFIRMATION_STATUSES: ConfirmationStatus[] = [
  "Pendente",
  "Confirmado",
  "Recusado",
  "Substituído",
];

export const PRESENCE_STATUSES: PresenceStatus[] = ["Pendente", "Presente", "Ausente"];

export const USER_ROLES: UserRole[] = ["Administrador", "Líder Kadosh", "Operador"];

export const CHECKLIST_STATUSES: ChecklistStatus[] = [
  "Pendente",
  "Em andamento",
  "Concluído",
  "Com problema",
];

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  Administrador: ["equipe", "cultos", "escalas", "hinos", "sonoplastia", "historico", "automacoes", "configuracoes"],
  "Líder Kadosh": ["equipe", "cultos", "escalas", "hinos", "sonoplastia", "historico"],
  Operador: ["escalas", "hinos", "sonoplastia"],
};

export const STATUS_COLORS: Record<string, string> = {
  // status gerais positivos
  Confirmado: "border-green-500/40 bg-green-500/10 text-green-400",
  Confirmada: "border-green-500/40 bg-green-500/10 text-green-400",
  Presente: "border-green-500/40 bg-green-500/10 text-green-400",
  Enviado: "border-green-500/40 bg-green-500/10 text-green-400",
  Ativo: "border-green-500/40 bg-green-500/10 text-green-400",
  Realizado: "border-kadosh-beige-mid/40 bg-kadosh-beige-mid/10 text-kadosh-beige-mid",
  Realizada: "border-kadosh-beige-mid/40 bg-kadosh-beige-mid/10 text-kadosh-beige-mid",
  // pendentes / em andamento
  Pendente: "border-kadosh-burnt/40 bg-kadosh-burnt/10 text-kadosh-burnt",
  Planejado: "border-kadosh-burnt/40 bg-kadosh-burnt/10 text-kadosh-burnt",
  Rascunho: "border-kadosh-burnt/40 bg-kadosh-burnt/10 text-kadosh-burnt",
  "Escala em montagem": "border-kadosh-fire/40 bg-kadosh-fire/10 text-kadosh-fire",
  "Aguardando confirmação": "border-kadosh-fire/40 bg-kadosh-fire/10 text-kadosh-fire",
  "Indisponível temporariamente": "border-kadosh-fire/40 bg-kadosh-fire/10 text-kadosh-fire",
  // negativos
  Recusado: "border-red-500/40 bg-red-500/10 text-red-400",
  Recusada: "border-red-500/40 bg-red-500/10 text-red-400",
  Cancelado: "border-red-500/40 bg-red-500/10 text-red-400",
  Cancelada: "border-red-500/40 bg-red-500/10 text-red-400",
  Ausente: "border-red-500/40 bg-red-500/10 text-red-400",
  Inativo: "border-red-500/40 bg-red-500/10 text-red-400",
  Erro: "border-red-500/40 bg-red-500/10 text-red-400",
  // substituído / neutro
  Substituído: "border-kadosh-beige-mid/40 bg-kadosh-beige-mid/10 text-kadosh-beige-mid",
  // checklist técnico
  "Em andamento": "border-kadosh-fire/40 bg-kadosh-fire/10 text-kadosh-fire",
  "Com problema": "border-red-500/40 bg-red-500/10 text-red-400",
};

export const ROLE_ICON_NAME: Record<MainRole, string> = {
  Cantor: "Mic2",
  Músico: "Guitar",
  "Técnico de som": "Sliders",
  Datashow: "MonitorPlay",
};
