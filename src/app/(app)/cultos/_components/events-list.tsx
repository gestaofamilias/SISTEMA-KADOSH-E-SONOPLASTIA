"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Clock, PenLine, Plus, Trash2 } from "lucide-react";
import type { WorshipEvent } from "@/lib/database.types";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { formatDateBadge, formatTime, isDateInCurrentWeek } from "@/lib/utils";
import { EventForm } from "./event-form";
import { createEvent, deleteEvent, updateEvent } from "../actions";

const WEEKLY_ORDER = ["Quinta-feira", "Sábado", "Domingo"];

export function EventsList({ events }: { events: WorshipEvent[] }) {
  const [modal, setModal] = useState<{ mode: "new" | "edit"; event?: WorshipEvent; defaultWeekday?: string } | null>(null);

  const { weekly, others } = useMemo(() => {
    const weekly: WorshipEvent[] = [];
    const others: WorshipEvent[] = [];
    for (const e of events) {
      if (WEEKLY_ORDER.includes(e.weekday ?? "") && isDateInCurrentWeek(e.event_date)) {
        weekly.push(e);
      } else {
        others.push(e);
      }
    }
    weekly.sort((a, b) => WEEKLY_ORDER.indexOf(a.weekday!) - WEEKLY_ORDER.indexOf(b.weekday!));
    others.sort((a, b) => a.event_date.localeCompare(b.event_date));
    return { weekly, others };
  }, [events]);

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="kadosh-section-title">🔥 Cultos desta semana</h3>
          <button onClick={() => setModal({ mode: "new" })} className="kadosh-btn-primary">
            <Plus className="h-4 w-4" />
            Novo culto
          </button>
        </div>
        {weekly.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Nenhum culto cadastrado para esta semana"
            description="Cadastre quinta, sábado e domingo para começar a montar as escalas."
            action={
              <button onClick={() => setModal({ mode: "new" })} className="kadosh-btn-secondary">
                <Plus className="h-4 w-4" />
                Cadastrar culto
              </button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {weekly.map((event) => (
              <EventCard key={event.id} event={event} onEdit={() => setModal({ mode: "edit", event })} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="kadosh-section-title mb-3">Outros cultos e eventos especiais</h3>
        {others.length === 0 ? (
          <p className="text-sm text-kadosh-beige-mid/60">Nenhum outro culto ou evento cadastrado.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((event) => (
              <EventCard key={event.id} event={event} onEdit={() => setModal({ mode: "edit", event })} />
            ))}
          </div>
        )}
      </section>

      <Modal
        title={modal?.mode === "edit" ? "Editar culto" : "Novo culto"}
        open={!!modal}
        onClose={() => setModal(null)}
      >
        {modal && (
          <EventForm
            event={modal.event}
            defaultWeekday={modal.defaultWeekday}
            onSubmit={modal.mode === "edit" ? updateEvent.bind(null, modal.event!.id) : createEvent}
            onDone={() => setModal(null)}
          />
        )}
      </Modal>
    </div>
  );
}

function EventCard({ event, onEdit }: { event: WorshipEvent; onEdit: () => void }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="kadosh-card kadosh-card-hover flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-kadosh-beige-light">{event.name}</p>
          <p className="text-xs text-kadosh-beige-mid/60">{event.event_type}</p>
        </div>
        <StatusBadge status={event.status} />
      </div>

      <div className="flex items-center gap-4 text-sm text-kadosh-beige-mid/80">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 text-kadosh-burnt" />
          {formatDateBadge(event.event_date)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-kadosh-burnt" />
          {formatTime(event.event_time)}
        </span>
      </div>

      {event.notes && <p className="text-xs text-kadosh-beige-mid/60">{event.notes}</p>}

      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        <button onClick={onEdit} className="kadosh-btn-ghost">
          <PenLine className="h-4 w-4" />
          Editar
        </button>
        {confirming ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => deleteEvent(event.id)}
              className="kadosh-btn-ghost !text-red-400"
            >
              Confirmar
            </button>
            <button onClick={() => setConfirming(false)} className="kadosh-btn-ghost">
              Cancelar
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirming(true)} className="kadosh-btn-ghost !text-red-400/80">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
