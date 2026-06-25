"use client";

import { useState, useTransition } from "react";
import { EVENT_STATUSES, EVENT_TYPES, WEEKDAYS } from "@/lib/constants";
import type { WorshipEvent } from "@/lib/database.types";

export function EventForm({
  event,
  defaultWeekday,
  onSubmit,
  onDone,
}: {
  event?: WorshipEvent;
  defaultWeekday?: string;
  onSubmit: (formData: FormData) => Promise<void>;
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await onSubmit(formData);
        onDone();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao salvar.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="kadosh-label" htmlFor="name">Nome do culto *</label>
        <input
          id="name"
          name="name"
          required
          defaultValue={event?.name}
          className="kadosh-input"
          placeholder="Ex: Culto de Celebração"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="kadosh-label" htmlFor="event_date">Data *</label>
          <input
            id="event_date"
            name="event_date"
            type="date"
            required
            defaultValue={event?.event_date}
            className="kadosh-input"
          />
        </div>
        <div>
          <label className="kadosh-label" htmlFor="event_time">Horário *</label>
          <input
            id="event_time"
            name="event_time"
            type="time"
            required
            defaultValue={event?.event_time?.slice(0, 5)}
            className="kadosh-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="kadosh-label" htmlFor="weekday">Dia da semana</label>
          <select id="weekday" name="weekday" defaultValue={event?.weekday ?? defaultWeekday ?? "Outro"} className="kadosh-input">
            {WEEKDAYS.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="kadosh-label" htmlFor="event_type">Tipo de culto *</label>
          <select id="event_type" name="event_type" defaultValue={event?.event_type ?? "Culto de Louvor"} className="kadosh-input">
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="kadosh-label" htmlFor="status">Status *</label>
        <select id="status" name="status" defaultValue={event?.status ?? "Planejado"} className="kadosh-input">
          {EVENT_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="kadosh-label" htmlFor="notes">Observações</label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={event?.notes ?? ""}
          className="kadosh-input resize-none"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onDone} className="kadosh-btn-secondary">
          Cancelar
        </button>
        <button type="submit" disabled={pending} className="kadosh-btn-primary">
          {pending ? "Salvando..." : "Salvar culto"}
        </button>
      </div>
    </form>
  );
}
