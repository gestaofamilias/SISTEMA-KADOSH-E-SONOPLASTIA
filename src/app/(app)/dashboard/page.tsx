import Link from "next/link";
import {
  CalendarCheck2,
  CalendarDays,
  ClipboardList,
  Flame,
  ListMusic,
  Music2,
  Plus,
  Sliders,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { BirthdayList } from "@/components/birthdays/birthday-list";
import type { TeamMember, WorshipEvent } from "@/lib/database.types";
import { getWeekScheduleData } from "@/lib/queries";
import { StatCard } from "./_components/stat-card";
import { WeekEventCard } from "./_components/week-event-card";

const WEEKLY_ORDER = ["Quinta-feira", "Sábado", "Domingo"];

export default async function DashboardPage() {
  const { weekData, members, totalEvents, latestSchedule } = await getWeekScheduleData();

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

  const totalTechnicalChecklists = weekData.filter((d) => d.scheduleId).length;
  const completedTechnicalChecklists = weekData.filter(
    (d) => d.technicalChecklist?.status === "Concluído"
  ).length;

  const technicalStatusLabel =
    totalTechnicalChecklists === 0
      ? "Sem escalas criadas"
      : completedTechnicalChecklists === totalTechnicalChecklists
      ? "Checklists prontos"
      : `${completedTechnicalChecklists} de ${totalTechnicalChecklists} prontos`;

  const allMembers = members;

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="kadosh-card flex items-center gap-4 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-kadosh-fire/15 text-kadosh-fire">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-kadosh-beige-light">{weekStatusLabel}</p>
            <p className="text-xs text-kadosh-beige-mid/60">Status geral da semana</p>
          </div>
        </div>
        <div className="kadosh-card flex items-center gap-4 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-kadosh-fire/15 text-kadosh-fire">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-kadosh-beige-light">{technicalStatusLabel}</p>
            <p className="text-xs text-kadosh-beige-mid/60">Técnica da Semana</p>
          </div>
        </div>
        <div className="kadosh-card flex items-center gap-4 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-kadosh-fire/15 text-kadosh-fire">
            <CalendarCheck2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-kadosh-beige-light truncate max-w-[150px]">
              {latestSchedule ? (latestSchedule.worship_events as WorshipEvent)?.name : "Nenhuma escala"}
            </p>
            <p className="text-xs text-kadosh-beige-mid/60">Última escala criada</p>
          </div>
        </div>
        <div className="kadosh-card p-4">
          <p className="mb-1 text-xs font-semibold text-kadosh-beige-light flex items-center gap-1">🎂 Aniversariantes</p>
          <div className="max-h-20 overflow-y-auto pr-1">
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
