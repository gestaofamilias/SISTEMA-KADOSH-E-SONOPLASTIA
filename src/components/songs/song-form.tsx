"use client";

import { useState, useTransition } from "react";
import type { TeamMember, WeeklySong } from "@/lib/database.types";

export function SongForm({
  song,
  eventId,
  scheduleId,
  nextOrder,
  teamMembers,
  onSubmit,
  onDone,
}: {
  song?: WeeklySong;
  eventId: string;
  scheduleId?: string | null;
  nextOrder: number;
  teamMembers: TeamMember[];
  onSubmit: (formData: FormData) => Promise<void>;
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("event_id", eventId);
    if (scheduleId) formData.set("schedule_id", scheduleId);
    startTransition(async () => {
      try {
        await onSubmit(formData);
        onDone();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao salvar hino.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-[80px_1fr] gap-3">
        <div>
          <label className="kadosh-label" htmlFor="song_order">Ordem</label>
          <input
            id="song_order"
            name="song_order"
            type="number"
            min={1}
            required
            defaultValue={song?.song_order ?? nextOrder}
            className="kadosh-input"
          />
        </div>
        <div>
          <label className="kadosh-label" htmlFor="song_name">Nome do hino *</label>
          <input
            id="song_name"
            name="song_name"
            required
            defaultValue={song?.song_name}
            className="kadosh-input"
            placeholder="Ex: Bondade de Deus"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="kadosh-label" htmlFor="key_tone">Tom</label>
          <input
            id="key_tone"
            name="key_tone"
            defaultValue={song?.key_tone ?? ""}
            className="kadosh-input"
            placeholder="Ex: G"
          />
        </div>
        <div>
          <label className="kadosh-label" htmlFor="lead_member_id">Quem vai puxar</label>
          <select id="lead_member_id" name="lead_member_id" defaultValue={song?.lead_member_id ?? ""} className="kadosh-input">
            <option value="">—</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.full_name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="kadosh-label" htmlFor="singer_notes">Observações para cantores</label>
        <textarea id="singer_notes" name="singer_notes" rows={2} defaultValue={song?.singer_notes ?? ""} className="kadosh-input resize-none" />
      </div>
      <div>
        <label className="kadosh-label" htmlFor="musician_notes">Observações para músicos</label>
        <textarea id="musician_notes" name="musician_notes" rows={2} defaultValue={song?.musician_notes ?? ""} className="kadosh-input resize-none" />
      </div>
      <div>
        <label className="kadosh-label" htmlFor="datashow_notes">Observações para datashow</label>
        <textarea id="datashow_notes" name="datashow_notes" rows={2} defaultValue={song?.datashow_notes ?? ""} className="kadosh-input resize-none" />
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onDone} className="kadosh-btn-secondary">Cancelar</button>
        <button type="submit" disabled={pending} className="kadosh-btn-primary">
          {pending ? "Salvando..." : "Salvar hino"}
        </button>
      </div>
    </form>
  );
}
