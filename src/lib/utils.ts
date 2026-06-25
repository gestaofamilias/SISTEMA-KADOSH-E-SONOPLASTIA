import { clsx, type ClassValue } from "clsx";
import {
  addDays,
  differenceInCalendarDays,
  format,
  isWithinInterval,
  parseISO,
  setYear,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDateLong(dateStr: string) {
  return format(parseISO(dateStr), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatDateShort(dateStr: string) {
  return format(parseISO(dateStr), "dd/MM/yyyy");
}

export function formatDateBadge(dateStr: string) {
  return format(parseISO(dateStr), "dd/MM (EEEE)", { locale: ptBR });
}

export function formatTime(timeStr: string) {
  return timeStr?.slice(0, 5) ?? "";
}

export function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export function phoneToWhatsappDigits(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("55") ? digits : `55${digits}`;
}

export function buildWhatsappLink(phone: string, message?: string) {
  const digits = phoneToWhatsappDigits(phone);
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

/** Semana atual (segunda a domingo) — usada para agrupar quinta, sábado e domingo. */
export function getCurrentWeekRange(reference = new Date()) {
  const start = startOfWeek(reference, { weekStartsOn: 1 });
  const end = addDays(start, 6);
  return { start, end };
}

export function isDateInCurrentWeek(dateStr: string, reference = new Date()) {
  const { start, end } = getCurrentWeekRange(reference);
  const date = parseISO(dateStr);
  return isWithinInterval(date, { start, end });
}

/** Próxima ocorrência do aniversário (considera virada de ano). */
export function nextBirthdayOccurrence(birthday: string, reference = new Date()) {
  const parsed = parseISO(birthday);
  let next = setYear(parsed, reference.getFullYear());
  if (differenceInCalendarDays(next, reference) < 0) {
    next = setYear(parsed, reference.getFullYear() + 1);
  }
  return next;
}

export function daysUntilBirthday(birthday: string, reference = new Date()) {
  const next = nextBirthdayOccurrence(birthday, reference);
  return differenceInCalendarDays(next, reference);
}

export function isBirthdayInMonth(birthday: string, reference = new Date()) {
  const parsed = parseISO(birthday);
  return parsed.getMonth() === reference.getMonth();
}

export function isBirthdayInNext7Days(birthday: string, reference = new Date()) {
  const days = daysUntilBirthday(birthday, reference);
  return days >= 0 && days <= 7;
}

export function formatBirthdayDisplay(birthday: string) {
  return format(parseISO(birthday), "dd/MM", { locale: ptBR });
}

export function buildBirthdayMessage(name: string) {
  const firstName = name.trim().split(" ")[0];
  return `🎉 Feliz aniversário, ${firstName}!\n\nQue Deus abençoe sua vida, sua família e seu ministério. Somos gratos por ter você no Kadosh. Que este novo ciclo seja cheio da presença do Senhor! 🙌🔥`;
}

export interface ScheduleMessagePerson {
  name: string;
  detail?: string | null;
}

export interface ScheduleMessageSong {
  order: number;
  name: string;
  keyTone?: string | null;
  leadName?: string | null;
}

export interface ScheduleMessageData {
  eventName: string;
  dateLabel: string;
  timeLabel: string;
  singers: ScheduleMessagePerson[];
  musicians: ScheduleMessagePerson[];
  soundTech?: string | null;
  datashowTech?: string | null;
  songs: ScheduleMessageSong[];
  notes?: string | null;
}

export function buildScheduleMessage(data: ScheduleMessageData) {
  const lines: string[] = [];
  lines.push(`🔥 ESCALA KADOSH — ${data.dateLabel}`);
  lines.push("");
  lines.push(`📍 Culto: ${data.eventName}`);
  lines.push(`🕖 Horário: ${data.timeLabel}`);
  lines.push("");
  lines.push("🎤 Cantores:");
  if (data.singers.length) {
    data.singers.forEach((p) => lines.push(`${p.name}${p.detail ? ` — ${p.detail}` : ""}`));
  } else {
    lines.push("—");
  }
  lines.push("");
  lines.push("🎸 Músicos:");
  if (data.musicians.length) {
    data.musicians.forEach((p) => lines.push(`${p.name}${p.detail ? ` — ${p.detail}` : ""}`));
  } else {
    lines.push("—");
  }
  lines.push("");
  lines.push("🎚️ Técnica:");
  lines.push(`Som: ${data.soundTech ?? "—"}`);
  lines.push(`Datashow: ${data.datashowTech ?? "—"}`);
  lines.push("");
  lines.push("🎵 Hinos:");
  if (data.songs.length) {
    data.songs
      .sort((a, b) => a.order - b.order)
      .forEach((s) => {
        lines.push(
          `${s.order}. ${s.name}${s.keyTone ? ` — Tom: ${s.keyTone}` : ""}${
            s.leadName ? ` — Puxa: ${s.leadName}` : ""
          }`
        );
      });
  } else {
    lines.push("—");
  }
  lines.push("");
  lines.push("⚠️ Observações:");
  lines.push(data.notes?.trim() ? data.notes.trim() : "—");
  lines.push("");
  lines.push("Por favor, confirme sua presença. 🙌🔥");

  return lines.join("\n");
}

export interface TechnicalScheduleMessageData {
  eventName: string;
  dateLabel: string;
  timeLabel: string;
  soundTech?: string | null;
  datashowTech?: string | null;
  songs: ScheduleMessageSong[];
  technicalNotes?: string | null;
}

export function buildTechnicalScheduleMessage(data: TechnicalScheduleMessageData) {
  const lines: string[] = [];
  lines.push(`🎚️ ESCALA TÉCNICA KADOSH — ${data.dateLabel}`);
  lines.push("");
  lines.push(`📍 Culto: ${data.eventName}`);
  lines.push(`🕖 Horário: ${data.timeLabel}`);
  lines.push("");
  lines.push("🔊 Técnico de som:");
  lines.push(data.soundTech ?? "—");
  lines.push("");
  lines.push("🖥️ Datashow:");
  lines.push(data.datashowTech ?? "—");
  lines.push("");
  lines.push("🎵 Hinos do culto:");
  lines.push("");
  if (data.songs.length) {
    data.songs
      .sort((a, b) => a.order - b.order)
      .forEach((s) => {
        lines.push(`${s.order}. ${s.name}${s.keyTone ? ` — Tom: ${s.keyTone}` : ""}`);
      });
  } else {
    lines.push("—");
  }
  lines.push("");
  lines.push("⚠️ Observações técnicas:");
  lines.push(data.technicalNotes?.trim() ? data.technicalNotes.trim() : "—");
  lines.push("");
  lines.push("Por favor, confirme sua presença na escala técnica. 🙌🔥");

  return lines.join("\n");
}


export async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}
