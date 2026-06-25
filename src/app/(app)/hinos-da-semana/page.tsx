import { CalendarDays, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { WeeklySongsBlock } from "@/components/songs/weekly-songs-block";
import { formatDateBadge, formatTime } from "@/lib/utils";
import { Music2 } from "lucide-react";
import type { WeeklySong } from "@/lib/database.types";

export default async function HinosDaSemanaPage() {
  const supabase = await createClient();

  const todayIso = new Date().toISOString().slice(0, 10);

  const { data: events } = await supabase
    .from("worship_events")
    .select("*")
    .gte("event_date", todayIso)
    .neq("status", "Cancelado")
    .order("event_date", { ascending: true })
    .limit(12);

  const { data: teamMembers } = await supabase.from("team_members").select("*").order("full_name");

  const eventIds = (events ?? []).map((e) => e.id);
  const { data: songs } = eventIds.length
    ? await supabase
        .from("weekly_songs")
        .select("*, team_members(full_name)")
        .in("event_id", eventIds)
        .order("song_order")
    : { data: [] as WeeklySong[] };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hinos da Semana"
        subtitle="Defina a ordem, o tom e quem puxa cada hino dos próximos cultos"
      />

      {!events?.length ? (
        <EmptyState
          icon={Music2}
          title="Nenhum culto futuro cadastrado"
          description="Cadastre um culto em Cultos da Semana para começar a definir os hinos."
        />
      ) : (
        <div className="space-y-6">
          {events.map((event) => (
            <div key={event.id} className="kadosh-card space-y-5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-kadosh-burnt/10 pb-4">
                <div>
                  <p className="font-semibold text-kadosh-beige-light">{event.name}</p>
                  <div className="mt-1 flex items-center gap-4 text-sm text-kadosh-beige-mid/70">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-kadosh-burnt" />
                      {formatDateBadge(event.event_date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-kadosh-burnt" />
                      {formatTime(event.event_time)}
                    </span>
                  </div>
                </div>
              </div>

              <WeeklySongsBlock
                eventId={event.id}
                songs={(songs ?? []).filter((s) => s.event_id === event.id)}
                teamMembers={teamMembers ?? []}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
