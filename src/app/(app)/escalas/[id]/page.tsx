import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { WeeklySongsBlock } from "@/components/songs/weekly-songs-block";
import type { ScheduleMember, TeamMember } from "@/lib/database.types";
import { formatDateBadge, formatTime, type ScheduleMessageData } from "@/lib/utils";
import { ScheduleHeader } from "../_components/schedule-header";
import { RoleSlot } from "../_components/role-slot";
import { MessagePanel } from "../_components/message-panel";

export default async function EscalaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: schedule } = await supabase
    .from("schedules")
    .select("*, worship_events(*), schedule_members(*, team_members(*))")
    .eq("id", id)
    .single();

  if (!schedule) notFound();

  const event = schedule.worship_events;
  const members = (schedule.schedule_members ?? []) as Array<ScheduleMember & { team_members: TeamMember }>;

  const { data: teamMembers } = await supabase.from("team_members").select("*").order("full_name");
  const { data: songs } = await supabase
    .from("weekly_songs")
    .select("*, team_members(full_name)")
    .eq("event_id", event.id)
    .order("song_order");

  const singers = members.filter((m) => m.role === "Cantor");
  const musicians = members.filter((m) => m.role === "Músico");
  const soundTechs = members.filter((m) => m.role === "Técnico de som");
  const datashowTechs = members.filter((m) => m.role === "Datashow");
  const soundTech = soundTechs[0];
  const datashowTech = datashowTechs[0];

  const messageData: ScheduleMessageData = {
    eventName: event.name,
    dateLabel: formatDateBadge(event.event_date),
    timeLabel: formatTime(event.event_time),
    singers: singers.map((m) => ({
      name: m.team_members.full_name,
      detail: m.voice_type && m.voice_type !== "Não se aplica" ? m.voice_type : null,
    })),
    musicians: musicians.map((m) => ({
      name: m.team_members.full_name,
      detail: m.instrument && m.instrument !== "Não se aplica" ? m.instrument : null,
    })),
    soundTech: soundTech?.team_members.full_name ?? null,
    datashowTech: datashowTech?.team_members.full_name ?? null,
    songs: (songs ?? []).map((s) => ({
      order: s.song_order,
      name: s.song_name,
      keyTone: s.key_tone,
      leadName: (s as unknown as { team_members?: { full_name: string } }).team_members?.full_name ?? null,
    })),
    notes: schedule.general_notes,
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Escala" subtitle="Monte cantores, músicos, técnica e hinos para este culto" />

      <ScheduleHeader schedule={schedule} event={event} />

      <div className="kadosh-card space-y-6 p-5">
        <p className="kadosh-section-title">🎤 Cantores</p>
        <RoleSlot
          scheduleId={id}
          role="Cantor"
          label="Escalados"
          detailField="voice_type"
          members={singers}
          allTeamMembers={teamMembers ?? []}
        />
      </div>

      <div className="kadosh-card space-y-6 p-5">
        <p className="kadosh-section-title">🎸 Músicos</p>
        <RoleSlot
          scheduleId={id}
          role="Músico"
          label="Escalados"
          detailField="instrument"
          members={musicians}
          allTeamMembers={teamMembers ?? []}
        />
      </div>

      <div className="kadosh-card space-y-6 p-5">
        <p className="kadosh-section-title">🎚️ Técnica</p>
        <div className="grid gap-6 sm:grid-cols-2">
          <RoleSlot
            scheduleId={id}
            role="Técnico de som"
            label="Técnico de som"
            detailField={null}
            members={soundTechs}
            allTeamMembers={teamMembers ?? []}
          />
          <RoleSlot
            scheduleId={id}
            role="Datashow"
            label="Datashow"
            detailField={null}
            members={datashowTechs}
            allTeamMembers={teamMembers ?? []}
          />
        </div>
      </div>

      <div className="kadosh-card p-5">
        <WeeklySongsBlock
          eventId={event.id}
          scheduleId={id}
          songs={songs ?? []}
          teamMembers={teamMembers ?? []}
        />
      </div>

      <MessagePanel
        scheduleId={id}
        messageData={messageData}
        initialMessage={schedule.whatsapp_message}
        n8nSent={schedule.n8n_sent}
      />
    </div>
  );
}
