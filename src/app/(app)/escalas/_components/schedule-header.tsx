"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock, Trash2 } from "lucide-react";
import type { Schedule, WorshipEvent } from "@/lib/database.types";
import { SCHEDULE_STATUSES } from "@/lib/constants";
import { formatDateBadge, formatTime } from "@/lib/utils";
import { deleteSchedule, updateScheduleMeta } from "../actions";

export function ScheduleHeader({ schedule, event }: { schedule: Schedule; event: WorshipEvent }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(schedule.status);
  const [notes, setNotes] = useState(schedule.general_notes ?? "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function persist(nextStatus: string, nextNotes: string) {
    const formData = new FormData();
    formData.set("status", nextStatus);
    formData.set("general_notes", nextNotes);
    startTransition(() => updateScheduleMeta(schedule.id, formData));
  }

  return (
    <div className="kadosh-card space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-kadosh-beige-mid/50">Culto</p>
          <h2 className="text-xl font-bold text-kadosh-beige-light">{event.name}</h2>
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

        <div className="flex items-center gap-2">
          <select
            value={status}
            disabled={pending}
            onChange={(e) => {
              setStatus(e.target.value as typeof status);
              persist(e.target.value, notes);
            }}
            className="kadosh-input !py-2 text-sm"
          >
            {SCHEDULE_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {confirmingDelete ? (
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() =>
                  startTransition(async () => {
                    await deleteSchedule(schedule.id);
                    router.push("/escalas");
                  })
                }
                className="kadosh-btn-secondary !border-red-500/40 !text-red-400 !py-2"
              >
                Confirmar exclusão
              </button>
              <button onClick={() => setConfirmingDelete(false)} className="kadosh-btn-ghost">
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="rounded-lg p-2 text-kadosh-beige-mid/50 hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="kadosh-label" htmlFor="general_notes">Observações gerais</label>
        <textarea
          id="general_notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => persist(status, notes)}
          className="kadosh-input resize-none"
          placeholder="Orientações gerais para esta escala..."
        />
      </div>
    </div>
  );
}
