"use client";

import Link from "next/link";
import { CalendarDays, ClipboardList, Clock, Mic2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateBadge, formatTime } from "@/lib/utils";
import type { Schedule, ScheduleMember, WorshipEvent } from "@/lib/database.types";

export type ScheduleWithRelations = Schedule & {
  worship_events: WorshipEvent;
  schedule_members: ScheduleMember[];
};

export function SchedulesList({ schedules }: { schedules: ScheduleWithRelations[] }) {
  if (!schedules.length) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Nenhuma escala criada ainda"
        description="Crie a primeira escala selecionando um culto cadastrado."
        action={
          <Link href="/escalas/nova" className="kadosh-btn-primary">
            Nova escala
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {schedules.map((s) => {
        const singers = s.schedule_members.filter((m) => m.role === "Cantor").length;
        const musicians = s.schedule_members.filter((m) => m.role === "Músico").length;
        const sound = s.schedule_members.find((m) => m.role === "Técnico de som");
        const datashow = s.schedule_members.find((m) => m.role === "Datashow");

        return (
          <Link
            key={s.id}
            href={`/escalas/${s.id}`}
            className="kadosh-card kadosh-card-hover flex flex-col gap-3 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-kadosh-beige-light">{s.worship_events.name}</p>
              <StatusBadge status={s.status} />
            </div>

            <div className="flex items-center gap-4 text-sm text-kadosh-beige-mid/80">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-kadosh-burnt" />
                {formatDateBadge(s.worship_events.event_date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-kadosh-burnt" />
                {formatTime(s.worship_events.event_time)}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 text-[11px] text-kadosh-beige-mid/70">
              <span className="flex items-center gap-1 rounded-full border border-kadosh-burnt/20 px-2.5 py-1">
                <Mic2 className="h-3 w-3" /> {singers} cantor{singers === 1 ? "" : "es"}
              </span>
              <span className="rounded-full border border-kadosh-burnt/20 px-2.5 py-1">
                {musicians} músico{musicians === 1 ? "" : "s"}
              </span>
              <span className="rounded-full border border-kadosh-burnt/20 px-2.5 py-1">
                Som: {sound ? "✓" : "—"}
              </span>
              <span className="rounded-full border border-kadosh-burnt/20 px-2.5 py-1">
                Datashow: {datashow ? "✓" : "—"}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
