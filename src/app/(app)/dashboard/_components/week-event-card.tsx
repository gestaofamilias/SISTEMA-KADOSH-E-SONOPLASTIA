import Link from "next/link";
import { CalendarDays, Clock, ListMusic, Mic2, MonitorPlay, Sliders } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateBadge, formatTime } from "@/lib/utils";
import type { ScheduleMember, TeamMember, WorshipEvent } from "@/lib/database.types";

export interface WeekEventData {
  event: WorshipEvent;
  scheduleId: string | null;
  scheduleStatus: string | null;
  members: Array<ScheduleMember & { team_members: TeamMember }>;
  songCount: number;
}

export function WeekEventCard({ data }: { data: WeekEventData }) {
  const { event, scheduleId, scheduleStatus, members, songCount } = data;
  const singers = members.filter((m) => m.role === "Cantor");
  const musicians = members.filter((m) => m.role === "Músico");
  const sound = members.find((m) => m.role === "Técnico de som");
  const datashow = members.find((m) => m.role === "Datashow");

  return (
    <div className="kadosh-card kadosh-card-hover flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-kadosh-fire">{event.weekday}</p>
          <p className="font-semibold text-kadosh-beige-light">{event.name}</p>
        </div>
        <StatusBadge status={scheduleStatus ?? event.status} />
      </div>

      <div className="flex items-center gap-4 text-sm text-kadosh-beige-mid/80">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 text-kadosh-burnt" />
          {formatDateBadge(event.event_date)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-kadosh-burnt" />
          {formatTime(event.event_time)}
        </span>
      </div>

      <div className="space-y-1.5 text-xs text-kadosh-beige-mid/75">
        <p className="flex items-center gap-1.5">
          <Mic2 className="h-3.5 w-3.5 text-kadosh-burnt" />
          {singers.length ? singers.map((s) => s.team_members.full_name).join(", ") : "Cantores: a definir"}
        </p>
        <p className="flex items-center gap-1.5">
          <Sliders className="h-3.5 w-3.5 text-kadosh-burnt" />
          {musicians.length ? musicians.map((s) => s.team_members.full_name).join(", ") : "Músicos: a definir"}
        </p>
        <p className="flex items-center gap-1.5">
          <Sliders className="h-3.5 w-3.5 text-kadosh-burnt" />
          Som: {sound?.team_members.full_name ?? "a definir"}
        </p>
        <p className="flex items-center gap-1.5">
          <MonitorPlay className="h-3.5 w-3.5 text-kadosh-burnt" />
          Datashow: {datashow?.team_members.full_name ?? "a definir"}
        </p>
        <p className="flex items-center gap-1.5">
          <ListMusic className="h-3.5 w-3.5 text-kadosh-burnt" />
          {songCount} hino{songCount === 1 ? "" : "s"} definido{songCount === 1 ? "" : "s"}
        </p>
      </div>

      <Link
        href={scheduleId ? `/escalas/${scheduleId}` : `/escalas/nova`}
        className="kadosh-btn-secondary mt-auto justify-center text-xs"
      >
        {scheduleId ? "Ver escala" : "Criar escala"}
      </Link>
    </div>
  );
}
