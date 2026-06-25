"use client";

import Link from "next/link";
import { CalendarDays, Clock, Sliders, MonitorPlay, ListMusic, PlusCircle } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateBadge, formatTime, type TechnicalScheduleMessageData } from "@/lib/utils";
import type { WeekEventData } from "@/lib/queries";
import { ChecklistForm } from "./checklist-form";
import { TechnicalNotesForm } from "./technical-notes-form";
import { TechnicalMessagePanel } from "./technical-message-panel";

export function SonoplastiaCard({ data, viewOnly = false }: { data: WeekEventData; viewOnly?: boolean }) {
  const { event, scheduleId, scheduleStatus, schedule, members, songs, technicalChecklist } = data;

  const soundTech = members.find((m) => m.role === "Técnico de som");
  const datashowTech = members.find((m) => m.role === "Datashow");

  // Preparar os dados para o painel de mensagens técnicas
  const soundTechName = soundTech?.team_members.full_name ?? null;
  const datashowTechName = datashowTech?.team_members.full_name ?? null;

  const songsForMessage = songs.map((s) => ({
    order: s.song_order,
    name: s.song_name,
    keyTone: s.key_tone,
    leadName: s.team_members?.full_name ?? null,
  }));

  const messageData: TechnicalScheduleMessageData = {
    eventName: event.name,
    dateLabel: formatDateBadge(event.event_date),
    timeLabel: formatTime(event.event_time),
    soundTech: soundTechName,
    datashowTech: datashowTechName,
    songs: songsForMessage,
    technicalNotes: schedule?.technical_notes ?? null,
  };

  const getConfirmationBadge = (status?: string) => {
    if (!status) return "—";
    const colors: Record<string, string> = {
      Pendente: "text-kadosh-fire",
      Confirmado: "text-green-400",
      Recusado: "text-red-400",
      Substituído: "text-kadosh-beige-mid/70",
    };
    return <span className={`text-[10px] font-semibold ${colors[status] || ""}`}>({status})</span>;
  };

  return (
    <div className="kadosh-card p-6">
      {/* Event Header */}
      <div className="border-b border-kadosh-burnt/10 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-kadosh-fire font-semibold">
              {event.weekday}
            </p>
            <h3 className="text-lg font-bold text-kadosh-beige-light">{event.name}</h3>
            <div className="mt-1 flex items-center gap-4 text-xs text-kadosh-beige-mid/70">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-kadosh-burnt" />
                {formatDateBadge(event.event_date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-kadosh-burnt" />
                {formatTime(event.event_time)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {scheduleStatus && <StatusBadge status={scheduleStatus} />}
            {technicalChecklist && <StatusBadge status={technicalChecklist.status} />}
          </div>
        </div>
      </div>

      {!scheduleId ? (
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
          <p className="text-sm text-kadosh-beige-mid/60">
            Não existe escala geral criada para este culto.
          </p>
          <Link href="/escalas/nova" className="kadosh-btn-secondary text-xs">
            <PlusCircle className="h-4 w-4 text-kadosh-fire" />
            Criar Escala Geral
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid gap-6 lg:grid-cols-12">
          {/* Left Column: Staff & Songs */}
          <div className="space-y-5 lg:col-span-5 border-b border-kadosh-burnt/10 pb-5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
            {/* Technical Team */}
            <div className="space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-kadosh-beige-mid/70 flex items-center gap-1.5">
                🎧 Equipe Técnica
              </p>
              <div className="space-y-2 rounded-xl bg-white/[0.01] p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-kadosh-beige-mid">
                    <Sliders className="h-4 w-4 text-kadosh-burnt" />
                    Som:
                  </span>
                  <span className="font-medium text-kadosh-beige-light flex items-center gap-1.5">
                    {soundTechName ?? <span className="text-kadosh-beige-mid/45">Não escalado</span>}
                    {soundTech && getConfirmationBadge(soundTech.confirmation_status)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-kadosh-beige-mid">
                    <MonitorPlay className="h-4 w-4 text-kadosh-burnt" />
                    Datashow:
                  </span>
                  <span className="font-medium text-kadosh-beige-light flex items-center gap-1.5">
                    {datashowTechName ?? <span className="text-kadosh-beige-mid/45">Não escalado</span>}
                    {datashowTech && getConfirmationBadge(datashowTech.confirmation_status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Songs List */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-kadosh-beige-mid/70 flex items-center gap-1.5">
                <ListMusic className="h-4 w-4 text-kadosh-burnt" />
                Hinos Selecionados ({songs.length})
              </p>
              {songs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-kadosh-burnt/10 p-4 text-center text-xs text-kadosh-beige-mid/50">
                  Nenhum hino selecionado para este culto ainda.
                </div>
              ) : (
                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                  {songs.map((song) => (
                    <div
                      key={song.id}
                      className="flex items-start justify-between gap-2 rounded-lg bg-white/[0.02] p-2 text-xs border border-white/[0.02]"
                    >
                      <div className="font-medium text-kadosh-beige-light">
                        {song.song_order}. {song.song_name}
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5 text-kadosh-beige-mid/70">
                        {song.key_tone && (
                          <span className="rounded bg-kadosh-burnt/10 px-1.5 py-0.5 font-mono text-[10px] text-kadosh-burnt">
                            {song.key_tone}
                          </span>
                        )}
                        {song.team_members?.full_name && (
                          <span className="text-[10px]">
                            Puxa: {song.team_members.full_name.split(" ")[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Forms & messaging */}
          <div className="lg:col-span-7 space-y-5">
            {!viewOnly && (
              <Link
                href={`/escalas/${scheduleId}`}
                className="kadosh-btn-secondary w-full justify-center !py-2 text-xs"
              >
                Editar escala técnica (som / datashow)
              </Link>
            )}

            {/* Checklist Form */}
            <ChecklistForm
              scheduleId={scheduleId}
              eventId={event.id}
              checklist={technicalChecklist}
              viewOnly={viewOnly}
            />

            <hr className="border-kadosh-burnt/10" />

            {/* Technical Notes Form */}
            <TechnicalNotesForm
              scheduleId={scheduleId}
              initialNotes={schedule?.technical_notes ?? null}
              viewOnly={viewOnly}
            />

            <hr className="border-kadosh-burnt/10" />

            {/* Technical Message Panel */}
            <TechnicalMessagePanel
              scheduleId={scheduleId}
              messageData={messageData}
              n8nSent={schedule?.confirmation_requested ?? false}
              viewOnly={viewOnly}
            />
          </div>
        </div>
      )}
    </div>
  );
}
