import Link from "next/link";
import {
  CalendarCheck2,
  CalendarDays,
  ClipboardList,
  Flame,
  ListMusic,
  Music2,
  Plus,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { BirthdayList } from "@/components/birthdays/birthday-list";
import { getCurrentWeekRange } from "@/lib/utils";
import type { ScheduleMember, TeamMember, WorshipEvent } from "@/lib/database.types";
import { StatCard } from "./_components/stat-card";
import { WeekEventCard, type WeekEventData } from "./_components/week-event-card";

const WEEKLY_ORDER = ["Quinta-feira", "Sábado", "Domingo"];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { start, end } = getCurrentWeekRange();
  const startIso = start.toISOString().slice(0, 10);
  const endIso = end.toISOString().slice(0, 10);

  const [
    { data: members },
    { data: weekEvents },
    { count: totalEvents },
    { data: latestSchedule },
  ] = await Promise.all([
    supabase.from("team_members").select("*"),
    supabase
      .from("worship_events")
      .select("*")
      .gte("event_date", startIso)
      .lte("event_date", endIso)
      .order("event_date", { ascending: true }),
    supabase.from("worship_events").select("*", { count: "exact", head: true }),
    supabase
      .from("schedules")
      .select("*, worship_events(*)")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const weeklyEvents = (weekEvents ?? []).filter((e) => WEEKLY_ORDER.includes(e.weekday ?? ""));
  const weeklyEventIds = weeklyEvents.map((e) => e.id);

  const [{ data: weekSchedules }, { data: weekSongs }] = await Promise.all([
    weeklyEventIds.length
      ? supabase
          .from("schedules")
          .select("*, schedule_members(*, team_members(*))")
          .in("event_id", weeklyEventIds)
      : Promise.resolve({ data: [] }),
    weeklyEventIds.length
      ? supabase.from("weekly_songs").select("id, event_id").in("event_id", weeklyEventIds)
      : Promise.resolve({ data: [] }),
  ]);

  const weekData: WeekEventData[] = weeklyEvents
    .sort((a, b) => WEEKLY_ORDER.indexOf(a.weekday!) - WEEKLY_ORDER.indexOf(b.weekday!))
    .map((event) => {
      const schedule = (weekSchedules ?? []).find((s) => s.event_id === event.id);
      return {
        event,
        scheduleId: schedule?.id ?? null,
        scheduleStatus: schedule?.status ?? null,
        members: (schedule?.schedule_members ?? []) as Array<ScheduleMember & { team_members: TeamMember }>,
        songCount: (weekSongs ?? []).filter((s) => s.event_id === event.id).length,
      };
    });

  const totalScaledThisWeek = weekData.reduce((sum, d) => sum + d.members.length, 0);
  const pendingConfirmations = weekData.reduce(
    (sum, d) => sum + d.members.filter((m) => m.confirmation_status === "Pendente").length,
    0
  );
  const songsDefinedThisWeek = weekData.reduce((sum, d) => sum + d.songCount, 0);

  const confirmedOrDone = weekData.filter((d) => ["Confirmada", "Realizada"].includes(d.scheduleStatus ?? "")).length;
  const weekStatusLabel = weekData.length === 0
    ? "Nenhum culto cadastrado"
    : confirmedOrDone === weekData.length
      ? "Semana confirmada"
      : weekData.some((d) => d.scheduleId)
        ? "Semana em montagem"
        : "Escalas pendentes de criação";

  const allMembers = (members ?? []) as TeamMember[];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle="Resumo da semana do Grupo Kadosh"
        actions={
          <>
            <Link href="/escalas/nova" className="kadosh-btn-primary">
              <Plus className="h-4 w-4" />
              Nova escala
            </Link>
            <Link href="/equipe/novo" className="kadosh-btn-secondary">
              <UserPlus className="h-4 w-4" />
              Cadastrar pessoa
            </Link>
            <Link href="/hinos-da-semana" className="kadosh-btn-secondary">
              <Music2 className="h-4 w-4" />
              Adicionar hino
            </Link>
            <Link
              href={latestSchedule ? `/escalas/${latestSchedule.id}` : "/escalas"}
              className="kadosh-btn-secondary"
            >
              <Sparkles className="h-4 w-4" />
              Gerar mensagem da escala
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CalendarDays} label="Cultos cadastrados" value={totalEvents ?? 0} />
        <StatCard icon={Users} label="Pessoas escaladas (semana)" value={totalScaledThisWeek} />
        <StatCard icon={ClipboardList} label="Confirmações pendentes" value={pendingConfirmations} />
        <StatCard icon={ListMusic} label="Hinos definidos (semana)" value={songsDefinedThisWeek} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="kadosh-card flex items-center gap-4 p-4 lg:col-span-1">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-kadosh-fire/15 text-kadosh-fire">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-kadosh-beige-light">{weekStatusLabel}</p>
            <p className="text-xs text-kadosh-beige-mid/60">Status geral da semana</p>
          </div>
        </div>
        <div className="kadosh-card flex items-center gap-4 p-4 lg:col-span-1">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-kadosh-fire/15 text-kadosh-fire">
            <CalendarCheck2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-kadosh-beige-light">
              {latestSchedule ? (latestSchedule.worship_events as WorshipEvent)?.name : "Nenhuma escala criada"}
            </p>
            <p className="text-xs text-kadosh-beige-mid/60">Última escala criada</p>
          </div>
        </div>
        <div className="kadosh-card p-4 lg:col-span-1">
          <p className="mb-2 text-sm font-semibold text-kadosh-beige-light">🎂 Próximos aniversariantes</p>
          <div className="max-h-32 overflow-y-auto pr-1">
            <BirthdayList members={allMembers} emptyLabel="Nenhum aniversário próximo." />
          </div>
        </div>
      </div>

      <section>
        <h3 className="kadosh-section-title mb-4">🔥 Cultos desta semana</h3>
        {weekData.length === 0 ? (
          <div className="kadosh-card p-6 text-center text-sm text-kadosh-beige-mid/60">
            Nenhum culto de quinta, sábado ou domingo cadastrado para esta semana.{" "}
            <Link href="/cultos" className="text-kadosh-fire hover:underline">
              Cadastrar agora
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {weekData.map((d) => (
              <WeekEventCard key={d.event.id} data={d} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
