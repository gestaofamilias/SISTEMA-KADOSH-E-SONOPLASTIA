import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { HistoryExplorer, type ParticipationRow, type SongRow } from "./_components/history-explorer";
import type { ScheduleMember, TeamMember, WeeklySong, WorshipEvent } from "@/lib/database.types";

export default async function HistoricoPage() {
  const supabase = await createClient();

  const { data: schedules } = await supabase
    .from("schedules")
    .select("*, worship_events(*), schedule_members(*, team_members(*))")
    .order("created_at", { ascending: false });

  const { data: songs } = await supabase
    .from("weekly_songs")
    .select("*, worship_events(*), team_members(full_name)")
    .order("song_order", { ascending: true });

  const participations: ParticipationRow[] = (schedules ?? []).flatMap((schedule) => {
    const event = schedule.worship_events as WorshipEvent;
    const members = (schedule.schedule_members ?? []) as Array<ScheduleMember & { team_members: TeamMember }>;
    return members.map((m) => ({
      id: m.id,
      eventDate: event.event_date,
      eventName: event.name,
      eventType: event.event_type,
      personName: m.team_members.full_name,
      role: m.role,
      detail:
        (m.voice_type && m.voice_type !== "Não se aplica" && m.voice_type) ||
        (m.instrument && m.instrument !== "Não se aplica" && m.instrument) ||
        null,
      confirmationStatus: m.confirmation_status,
      presenceStatus: m.presence_status,
      notes: m.notes,
    }));
  });

  const songRows: SongRow[] = (songs ?? []).map((s) => {
    const song = s as WeeklySong & { worship_events: WorshipEvent; team_members: { full_name: string } | null };
    return {
      id: song.id,
      eventDate: song.worship_events.event_date,
      eventName: song.worship_events.name,
      order: song.song_order,
      songName: song.song_name,
      keyTone: song.key_tone,
      leadName: song.team_members?.full_name ?? null,
    };
  });

  return (
    <div>
      <PageHeader
        title="Histórico"
        subtitle="Todo o histórico de escalas, hinos e confirmações já registrados no Kadosh"
      />
      <HistoryExplorer participations={participations} songs={songRows} />
    </div>
  );
}
