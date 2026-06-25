import { createClient } from "@/lib/supabase/server";
import { getCurrentWeekRange } from "@/lib/utils";
import type { Schedule, ScheduleMember, TeamMember, WorshipEvent, TechnicalChecklist, WeeklySong } from "@/lib/database.types";

export interface WeekEventData {
  event: WorshipEvent;
  scheduleId: string | null;
  scheduleStatus: string | null;
  schedule: Schedule | null;
  members: Array<ScheduleMember & { team_members: TeamMember }>;
  songCount: number;
  songs: Array<WeeklySong & { team_members: { full_name: string } | null }>;
  technicalChecklist: TechnicalChecklist | null;
}

const WEEKLY_ORDER = ["Quinta-feira", "Sábado", "Domingo"];

export async function getWeekScheduleData() {
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
    supabase.from("team_members").select("*").order("full_name"),
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

  const [
    { data: weekSchedules },
    { data: weekSongs },
    { data: weekChecklists },
  ] = await Promise.all([
    weeklyEventIds.length
      ? supabase
          .from("schedules")
          .select("*, schedule_members(*, team_members(*))")
          .in("event_id", weeklyEventIds)
      : Promise.resolve({ data: [] }),
    weeklyEventIds.length
      ? supabase
          .from("weekly_songs")
          .select("*, team_members(full_name)")
          .in("event_id", weeklyEventIds)
          .order("song_order", { ascending: true })
      : Promise.resolve({ data: [] }),
    weeklyEventIds.length
      ? supabase.from("technical_checklists").select("*").in("event_id", weeklyEventIds)
      : Promise.resolve({ data: [] }),
  ]);

  const weekData: WeekEventData[] = weeklyEvents
    .sort((a, b) => WEEKLY_ORDER.indexOf(a.weekday!) - WEEKLY_ORDER.indexOf(b.weekday!))
    .map((event) => {
      const schedule = (weekSchedules ?? []).find((s) => s.event_id === event.id);
      const technicalChecklist = (weekChecklists ?? []).find((c) => c.event_id === event.id) ?? null;
      const songsList = (weekSongs ?? []).filter((s) => s.event_id === event.id) as Array<
        WeeklySong & { team_members: { full_name: string } | null }
      >;
      return {
        event,
        scheduleId: schedule?.id ?? null,
        scheduleStatus: schedule?.status ?? null,
        schedule: schedule ?? null,
        members: (schedule?.schedule_members ?? []) as Array<ScheduleMember & { team_members: TeamMember }>,
        songCount: songsList.length,
        songs: songsList,
        technicalChecklist,
      };
    });


  return {
    weekData,
    members: (members ?? []) as TeamMember[],
    totalEvents: totalEvents ?? 0,
    latestSchedule,
  };
}
