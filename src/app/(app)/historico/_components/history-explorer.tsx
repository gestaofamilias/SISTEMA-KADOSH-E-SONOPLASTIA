"use client";

import { useMemo, useState } from "react";
import { History, ListMusic } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { MAIN_ROLES, CONFIRMATION_STATUSES } from "@/lib/constants";
import { formatDateShort } from "@/lib/utils";

export interface ParticipationRow {
  id: string;
  eventDate: string;
  eventName: string;
  eventType: string;
  personName: string;
  role: string;
  detail: string | null;
  confirmationStatus: string;
  presenceStatus: string;
  notes: string | null;
}

export interface SongRow {
  id: string;
  eventDate: string;
  eventName: string;
  order: number;
  songName: string;
  keyTone: string | null;
  leadName: string | null;
}

function monthKey(dateStr: string) {
  return dateStr.slice(0, 7);
}

function monthLabel(key: string) {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

export function HistoryExplorer({
  participations,
  songs,
}: {
  participations: ParticipationRow[];
  songs: SongRow[];
}) {
  const [month, setMonth] = useState("Todos");
  const [eventName, setEventName] = useState("Todos");
  const [person, setPerson] = useState("Todos");
  const [role, setRole] = useState("Todos");
  const [confirmation, setConfirmation] = useState("Todos");
  const [songSearch, setSongSearch] = useState("");

  const months = useMemo(() => {
    const set = new Set<string>();
    participations.forEach((p) => set.add(monthKey(p.eventDate)));
    songs.forEach((s) => set.add(monthKey(s.eventDate)));
    return Array.from(set).sort().reverse();
  }, [participations, songs]);

  const eventNames = useMemo(
    () => Array.from(new Set(participations.map((p) => p.eventName))).sort(),
    [participations]
  );
  const people = useMemo(
    () => Array.from(new Set(participations.map((p) => p.personName))).sort(),
    [participations]
  );

  const filteredParticipations = participations.filter((p) => {
    if (month !== "Todos" && monthKey(p.eventDate) !== month) return false;
    if (eventName !== "Todos" && p.eventName !== eventName) return false;
    if (person !== "Todos" && p.personName !== person) return false;
    if (role !== "Todos" && p.role !== role) return false;
    if (confirmation !== "Todos" && p.confirmationStatus !== confirmation) return false;
    return true;
  });

  const filteredSongs = songs.filter((s) => {
    if (month !== "Todos" && monthKey(s.eventDate) !== month) return false;
    if (eventName !== "Todos" && s.eventName !== eventName) return false;
    if (songSearch.trim() && !s.songName.toLowerCase().includes(songSearch.trim().toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="kadosh-card flex flex-wrap items-end gap-3 p-4">
        <FilterSelect label="Mês" value={month} onChange={setMonth} options={["Todos", ...months]} render={(v) => (v === "Todos" ? v : monthLabel(v))} />
        <FilterSelect label="Culto" value={eventName} onChange={setEventName} options={["Todos", ...eventNames]} />
        <FilterSelect label="Pessoa" value={person} onChange={setPerson} options={["Todos", ...people]} />
        <FilterSelect label="Função" value={role} onChange={setRole} options={["Todos", ...MAIN_ROLES]} />
        <FilterSelect label="Confirmação" value={confirmation} onChange={setConfirmation} options={["Todos", ...CONFIRMATION_STATUSES]} />
        <div>
          <label className="kadosh-label">Buscar hino</label>
          <input
            value={songSearch}
            onChange={(e) => setSongSearch(e.target.value)}
            placeholder="Nome do hino..."
            className="kadosh-input !py-2 text-sm"
          />
        </div>
      </div>

      <section>
        <h3 className="kadosh-section-title mb-3">
          <History className="h-5 w-5 text-kadosh-fire" />
          Participações
        </h3>
        {filteredParticipations.length === 0 ? (
          <EmptyState icon={History} title="Nenhum registro encontrado" description="Ajuste os filtros acima." />
        ) : (
          <div className="kadosh-card overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-kadosh-burnt/15 text-xs uppercase tracking-wide text-kadosh-beige-mid/50">
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Culto</th>
                  <th className="px-4 py-3">Pessoa</th>
                  <th className="px-4 py-3">Função</th>
                  <th className="px-4 py-3">Confirmação</th>
                  <th className="px-4 py-3">Presença</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipations.map((p) => (
                  <tr key={p.id} className="border-b border-kadosh-burnt/8 last:border-0">
                    <td className="px-4 py-3 text-kadosh-beige-mid/80">{formatDateShort(p.eventDate)}</td>
                    <td className="px-4 py-3 text-kadosh-beige-light">{p.eventName}</td>
                    <td className="px-4 py-3 text-kadosh-beige-light">{p.personName}</td>
                    <td className="px-4 py-3 text-kadosh-beige-mid/80">
                      {p.role}
                      {p.detail ? ` — ${p.detail}` : ""}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={p.confirmationStatus} /></td>
                    <td className="px-4 py-3"><StatusBadge status={p.presenceStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h3 className="kadosh-section-title mb-3">
          <ListMusic className="h-5 w-5 text-kadosh-fire" />
          Hinos cantados
        </h3>
        {filteredSongs.length === 0 ? (
          <EmptyState icon={ListMusic} title="Nenhum hino encontrado" description="Ajuste os filtros acima." />
        ) : (
          <div className="kadosh-card overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-kadosh-burnt/15 text-xs uppercase tracking-wide text-kadosh-beige-mid/50">
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Culto</th>
                  <th className="px-4 py-3">Ordem</th>
                  <th className="px-4 py-3">Hino</th>
                  <th className="px-4 py-3">Tom</th>
                  <th className="px-4 py-3">Quem puxou</th>
                </tr>
              </thead>
              <tbody>
                {filteredSongs.map((s) => (
                  <tr key={s.id} className="border-b border-kadosh-burnt/8 last:border-0">
                    <td className="px-4 py-3 text-kadosh-beige-mid/80">{formatDateShort(s.eventDate)}</td>
                    <td className="px-4 py-3 text-kadosh-beige-light">{s.eventName}</td>
                    <td className="px-4 py-3 text-kadosh-beige-mid/80">{s.order}</td>
                    <td className="px-4 py-3 text-kadosh-beige-light">{s.songName}</td>
                    <td className="px-4 py-3 text-kadosh-beige-mid/80">{s.keyTone ?? "—"}</td>
                    <td className="px-4 py-3 text-kadosh-beige-mid/80">{s.leadName ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  render,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  render?: (v: string) => string;
}) {
  return (
    <div>
      <label className="kadosh-label">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="kadosh-input !py-2 text-sm">
        {options.map((o) => (
          <option key={o} value={o}>{render ? render(o) : o}</option>
        ))}
      </select>
    </div>
  );
}
