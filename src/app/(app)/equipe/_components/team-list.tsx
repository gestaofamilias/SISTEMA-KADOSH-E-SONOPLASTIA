"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Guitar, Mic2, MonitorPlay, Phone, Search, Sliders, UserRound } from "lucide-react";
import type { TeamMember } from "@/lib/database.types";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatPhone } from "@/lib/utils";

type FilterKey = "Todos" | "Cantores" | "Músicos" | "Técnico de som" | "Datashow" | "Ativos" | "Inativos";

const FILTERS: FilterKey[] = ["Todos", "Cantores", "Músicos", "Técnico de som", "Datashow", "Ativos", "Inativos"];

const ROLE_ICON: Record<string, typeof Mic2> = {
  Cantor: Mic2,
  Músico: Guitar,
  "Técnico de som": Sliders,
  Datashow: MonitorPlay,
};

function matchesFilter(member: TeamMember, filter: FilterKey) {
  const allRoles = [member.main_role, ...member.secondary_roles];
  switch (filter) {
    case "Todos":
      return true;
    case "Cantores":
      return allRoles.includes("Cantor");
    case "Músicos":
      return allRoles.includes("Músico");
    case "Técnico de som":
      return allRoles.includes("Técnico de som");
    case "Datashow":
      return allRoles.includes("Datashow");
    case "Ativos":
      return member.status === "Ativo";
    case "Inativos":
      return member.status !== "Ativo";
  }
}

export function TeamList({ members }: { members: TeamMember[] }) {
  const [filter, setFilter] = useState<FilterKey>("Todos");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return members.filter((m) => {
      if (!matchesFilter(m, filter)) return false;
      if (!term) return true;
      const haystack = [m.full_name, m.main_role, ...m.secondary_roles, m.instrument, m.phone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [members, filter, search]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? "border-kadosh-fire bg-kadosh-fire/15 text-kadosh-beige-light"
                  : "border-kadosh-burnt/20 text-kadosh-beige-mid/70 hover:border-kadosh-burnt/40"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-kadosh-beige-mid/50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, função, telefone..."
            className="kadosh-input pl-10"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title="Nenhuma pessoa encontrada"
          description="Ajuste os filtros ou cadastre um novo integrante."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  const Icon = ROLE_ICON[member.main_role] ?? UserRound;
  const allRoles = [member.main_role, ...member.secondary_roles];

  return (
    <Link
      href={`/equipe/${member.id}`}
      className="kadosh-card kadosh-card-hover flex flex-col gap-3 p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kadosh-fire/15 text-kadosh-fire">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-kadosh-beige-light">{member.full_name}</p>
            <p className="flex items-center gap-1 text-xs text-kadosh-beige-mid/60">
              <Phone className="h-3 w-3" />
              {formatPhone(member.phone)}
            </p>
          </div>
        </div>
        <StatusBadge status={member.status} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {allRoles.map((role) => (
          <span
            key={role}
            className="rounded-full border border-kadosh-burnt/25 bg-kadosh-black/30 px-2.5 py-1 text-[11px] text-kadosh-beige-mid/80"
          >
            {role}
          </span>
        ))}
      </div>

      {(member.voice_type && member.voice_type !== "Não se aplica") ||
      (member.instrument && member.instrument !== "Não se aplica") ? (
        <p className="text-xs text-kadosh-beige-mid/60">
          {member.voice_type && member.voice_type !== "Não se aplica" && `Voz: ${member.voice_type}`}
          {member.voice_type &&
            member.voice_type !== "Não se aplica" &&
            member.instrument &&
            member.instrument !== "Não se aplica" &&
            " • "}
          {member.instrument && member.instrument !== "Não se aplica" && `Instrumento: ${member.instrument}`}
        </p>
      ) : null}
    </Link>
  );
}
