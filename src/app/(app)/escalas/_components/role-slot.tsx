"use client";

import { useMemo, useState, useTransition } from "react";
import { Trash2, UserPlus } from "lucide-react";
import type { MainRole, ScheduleMember, TeamMember } from "@/lib/database.types";
import { CONFIRMATION_STATUSES, INSTRUMENTS, PRESENCE_STATUSES, VOICE_TYPES } from "@/lib/constants";
import { StatusBadge } from "@/components/ui/status-badge";
import { addScheduleMember, removeScheduleMember, updateScheduleMemberStatus } from "../actions";

type ScheduleMemberWithTeam = ScheduleMember & { team_members: TeamMember };

export function RoleSlot({
  scheduleId,
  role,
  label,
  detailField,
  members,
  allTeamMembers,
}: {
  scheduleId: string;
  role: MainRole;
  label: string;
  detailField: "voice_type" | "instrument" | null;
  members: ScheduleMemberWithTeam[];
  allTeamMembers: TeamMember[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState("");
  const [detailValue, setDetailValue] = useState("");

  const alreadyAddedIds = useMemo(() => new Set(members.map((m) => m.member_id)), [members]);

  const eligible = useMemo(
    () =>
      allTeamMembers.filter(
        (m) =>
          (m.main_role === role || m.secondary_roles.includes(role)) && !alreadyAddedIds.has(m.id)
      ),
    [allTeamMembers, role, alreadyAddedIds]
  );

  function handleAdd() {
    if (!selectedMember) return;
    setError(null);
    const formData = new FormData();
    formData.set("member_id", selectedMember);
    formData.set("role", role);
    if (detailField === "voice_type") formData.set("voice_type", detailValue || "Não se aplica");
    if (detailField === "instrument") formData.set("instrument", detailValue || "Não se aplica");

    startTransition(async () => {
      try {
        await addScheduleMember(scheduleId, formData);
        setSelectedMember("");
        setDetailValue("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao adicionar.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-kadosh-beige-mid/80">{label}</p>

      {members.length > 0 && (
        <ul className="space-y-2">
          {members.map((m) => (
            <MemberRow key={m.id} scheduleId={scheduleId} member={m} />
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-kadosh-burnt/25 p-2.5">
        <select
          value={selectedMember}
          onChange={(e) => {
            setSelectedMember(e.target.value);
            const m = eligible.find((x) => x.id === e.target.value);
            if (detailField === "voice_type") setDetailValue(m?.voice_type ?? "");
            if (detailField === "instrument") setDetailValue(m?.instrument ?? "");
          }}
          className="kadosh-input !py-2 flex-1 min-w-[160px] text-sm"
        >
          <option value="">Selecionar pessoa...</option>
          {eligible.map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name}
            </option>
          ))}
        </select>

        {detailField === "voice_type" && selectedMember && (
          <select value={detailValue} onChange={(e) => setDetailValue(e.target.value)} className="kadosh-input !py-2 w-40 text-sm">
            {VOICE_TYPES.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        )}
        {detailField === "instrument" && selectedMember && (
          <select value={detailValue} onChange={(e) => setDetailValue(e.target.value)} className="kadosh-input !py-2 w-40 text-sm">
            {INSTRUMENTS.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        )}

        <button
          onClick={handleAdd}
          disabled={!selectedMember || pending}
          className="kadosh-btn-secondary !py-2"
        >
          <UserPlus className="h-4 w-4" />
          Adicionar
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {eligible.length === 0 && members.length === 0 && (
        <p className="text-xs text-kadosh-beige-mid/50">
          Nenhuma pessoa cadastrada com esta função ainda.
        </p>
      )}
    </div>
  );
}

function MemberRow({
  scheduleId,
  member,
}: {
  scheduleId: string;
  member: ScheduleMemberWithTeam;
}) {
  const [pending, startTransition] = useTransition();

  function handleStatusChange(field: "confirmation_status" | "presence_status", value: string) {
    const formData = new FormData();
    formData.set(
      "confirmation_status",
      field === "confirmation_status" ? value : member.confirmation_status
    );
    formData.set("presence_status", field === "presence_status" ? value : member.presence_status);
    startTransition(async () => {
      await updateScheduleMemberStatus(member.id, scheduleId, formData);
    });
  }

  const detail =
    member.voice_type && member.voice_type !== "Não se aplica"
      ? member.voice_type
      : member.instrument && member.instrument !== "Não se aplica"
        ? member.instrument
        : null;

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-kadosh-burnt/15 bg-kadosh-black/30 px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-kadosh-beige-light">
          {member.team_members.full_name}
          {detail && <span className="ml-1.5 text-xs text-kadosh-beige-mid/60">— {detail}</span>}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={member.confirmation_status}
          disabled={pending}
          onChange={(e) => handleStatusChange("confirmation_status", e.target.value)}
          className="rounded-lg border border-kadosh-burnt/25 bg-kadosh-black/50 px-2 py-1 text-xs text-kadosh-beige-light"
        >
          {CONFIRMATION_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={member.presence_status}
          disabled={pending}
          onChange={(e) => handleStatusChange("presence_status", e.target.value)}
          className="rounded-lg border border-kadosh-burnt/25 bg-kadosh-black/50 px-2 py-1 text-xs text-kadosh-beige-light"
        >
          {PRESENCE_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <StatusBadge status={member.confirmation_status} className="hidden sm:inline-flex" />
        <button
          onClick={() => startTransition(() => removeScheduleMember(member.id, scheduleId))}
          className="rounded-lg p-1.5 text-kadosh-beige-mid/50 hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}
