"use client";

import { useState } from "react";
import { ListMusic, PenLine, Plus, Trash2 } from "lucide-react";
import type { TeamMember, WeeklySong } from "@/lib/database.types";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { SongForm } from "./song-form";
import { createSong, deleteSong, updateSong } from "@/app/(app)/hinos-da-semana/actions";

type WeeklySongWithLead = WeeklySong & { team_members?: { full_name: string } | null };

export function WeeklySongsBlock({
  eventId,
  scheduleId,
  songs,
  teamMembers,
}: {
  eventId: string;
  scheduleId?: string | null;
  songs: WeeklySongWithLead[];
  teamMembers: TeamMember[];
}) {
  const [modal, setModal] = useState<{ mode: "new" | "edit"; song?: WeeklySongWithLead } | null>(null);
  const sorted = [...songs].sort((a, b) => a.song_order - b.song_order);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-kadosh-beige-mid/80">🎵 Hinos</p>
        <button onClick={() => setModal({ mode: "new" })} className="kadosh-btn-ghost text-kadosh-fire">
          <Plus className="h-4 w-4" />
          Adicionar hino
        </button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={ListMusic} title="Nenhum hino definido ainda" />
      ) : (
        <ol className="space-y-2">
          {sorted.map((song) => (
            <li
              key={song.id}
              className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-kadosh-burnt/15 bg-kadosh-black/30 px-3.5 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-sm text-kadosh-beige-light">
                  <span className="text-kadosh-fire">{song.song_order}.</span> {song.song_name}
                  {song.key_tone && <span className="text-kadosh-beige-mid/60"> — Tom: {song.key_tone}</span>}
                  {song.team_members?.full_name && (
                    <span className="text-kadosh-beige-mid/60"> — Puxa: {song.team_members.full_name}</span>
                  )}
                </p>
                {(song.singer_notes || song.musician_notes || song.datashow_notes) && (
                  <p className="mt-1 text-xs text-kadosh-beige-mid/50">
                    {[song.singer_notes, song.musician_notes, song.datashow_notes].filter(Boolean).join(" • ")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setModal({ mode: "edit", song })} className="rounded-lg p-1.5 text-kadosh-beige-mid/60 hover:bg-kadosh-burnt/10 hover:text-kadosh-beige-light">
                  <PenLine className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => deleteSong(song.id, scheduleId)}
                  className="rounded-lg p-1.5 text-kadosh-beige-mid/50 hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <Modal title={modal?.mode === "edit" ? "Editar hino" : "Adicionar hino"} open={!!modal} onClose={() => setModal(null)}>
        {modal && (
          <SongForm
            song={modal.song}
            eventId={eventId}
            scheduleId={scheduleId}
            nextOrder={sorted.length + 1}
            teamMembers={teamMembers}
            onSubmit={modal.mode === "edit" ? updateSong.bind(null, modal.song!.id) : createSong}
            onDone={() => setModal(null)}
          />
        )}
      </Modal>
    </div>
  );
}
