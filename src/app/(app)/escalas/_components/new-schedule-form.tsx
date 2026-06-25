"use client";

import { useState, useTransition } from "react";
import type { WorshipEvent } from "@/lib/database.types";
import { formatDateBadge, formatTime } from "@/lib/utils";
import { createSchedule } from "../actions";

export function NewScheduleForm({ events }: { events: WorshipEvent[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createSchedule(formData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao criar escala.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="kadosh-card space-y-5 p-6">
      <div>
        <label className="kadosh-label" htmlFor="event_id">Culto *</label>
        <select id="event_id" name="event_id" required className="kadosh-input" defaultValue="">
          <option value="" disabled>
            Selecione um culto cadastrado
          </option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} — {formatDateBadge(e.event_date)} às {formatTime(e.event_time)}
            </option>
          ))}
        </select>
        {events.length === 0 && (
          <p className="mt-2 text-xs text-kadosh-burnt">
            Nenhum culto cadastrado ainda. Cadastre um culto em &quot;Cultos da Semana&quot; antes de criar a escala.
          </p>
        )}
      </div>

      <div>
        <label className="kadosh-label" htmlFor="general_notes">Observações gerais</label>
        <textarea
          id="general_notes"
          name="general_notes"
          rows={3}
          className="kadosh-input resize-none"
          placeholder="Alguma orientação geral para esta escala..."
        />
      </div>

      <input type="hidden" name="status" value="Rascunho" />

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={pending || events.length === 0} className="kadosh-btn-primary">
          {pending ? "Criando..." : "Criar escala e continuar"}
        </button>
      </div>
    </form>
  );
}
