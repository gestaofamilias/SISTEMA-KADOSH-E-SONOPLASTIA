import Link from "next/link";
import { AudioLines, CalendarCheck2, ClipboardList, MonitorPlay, Sliders } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/app/(app)/dashboard/_components/stat-card";
import { getWeekScheduleData } from "@/lib/queries";
import { formatDateBadge } from "@/lib/utils";
import { SonoplastiaCard } from "./_components/sonoplastia-card";

export default async function SonoplastiaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();
  const viewOnly = profile?.role === "Operador";

  const { weekData } = await getWeekScheduleData();

  const today = new Date().toISOString().slice(0, 10);
  const nextCulto = weekData.find((d) => d.event.event_date >= today) ?? weekData[0] ?? null;
  const nextSoundTech = nextCulto?.members.find((m) => m.role === "Técnico de som");
  const nextDatashowTech = nextCulto?.members.find((m) => m.role === "Datashow");

  const pendingTechnicalConfirmations = weekData.reduce(
    (sum, d) =>
      sum +
      d.members.filter(
        (m) => (m.role === "Técnico de som" || m.role === "Datashow") && m.confirmation_status === "Pendente"
      ).length,
    0
  );
  const technicalSchedulesThisWeek = weekData.filter(
    (d) => d.members.some((m) => m.role === "Técnico de som" || m.role === "Datashow")
  ).length;

  const { data: lastRealized } = await supabase
    .from("schedules")
    .select("*, worship_events(*), schedule_members(*, team_members(*))")
    .eq("status", "Realizada")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sonoplastia"
        subtitle="Controle de mesa de som, microfones, projeção de slides (datashow) e playbacks"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={CalendarCheck2}
          label="Próximo culto"
          value={nextCulto ? nextCulto.event.name : "—"}
          hint={nextCulto ? formatDateBadge(nextCulto.event.event_date) : undefined}
        />
        <StatCard
          icon={Sliders}
          label="Técnico de som escalado"
          value={nextSoundTech?.team_members.full_name ?? "A definir"}
        />
        <StatCard
          icon={MonitorPlay}
          label="Datashow escalado"
          value={nextDatashowTech?.team_members.full_name ?? "A definir"}
        />
        <StatCard
          icon={ClipboardList}
          label="Confirmações técnicas pendentes"
          value={pendingTechnicalConfirmations}
        />
        <StatCard
          icon={AudioLines}
          label="Escalas técnicas da semana"
          value={technicalSchedulesThisWeek}
        />
        <StatCard
          icon={CalendarCheck2}
          label="Última escala técnica realizada"
          value={lastRealized ? lastRealized.worship_events.name : "Nenhuma ainda"}
          hint={lastRealized ? formatDateBadge(lastRealized.worship_events.event_date) : undefined}
        />
      </div>

      {viewOnly && (
        <p className="kadosh-tag w-fit">
          Modo de visualização — apenas Administradores e Líderes podem editar a escala técnica.
        </p>
      )}

      {weekData.length === 0 ? (
        <EmptyState
          icon={AudioLines}
          title="Nenhum culto cadastrado para esta semana"
          description="Cadastre novos cultos ou eventos na aba de Cultos para começar a gerenciar a sonoplastia."
        />
      ) : (
        <div className="space-y-8">
          {weekData.map((data) => (
            <SonoplastiaCard key={data.event.id} data={data} viewOnly={viewOnly} />
          ))}
        </div>
      )}

      {lastRealized && (
        <div className="kadosh-card flex items-center justify-between gap-4 p-4">
          <p className="text-sm text-kadosh-beige-mid/80">
            Última escala técnica realizada: <span className="text-kadosh-beige-light font-medium">{lastRealized.worship_events.name}</span> ({formatDateBadge(lastRealized.worship_events.event_date)})
          </p>
          <Link href={`/escalas/${lastRealized.id}`} className="kadosh-btn-secondary text-xs">
            Ver escala
          </Link>
        </div>
      )}
    </div>
  );
}
