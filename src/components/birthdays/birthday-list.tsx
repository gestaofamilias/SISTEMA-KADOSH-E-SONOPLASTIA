"use client";

import { useState } from "react";
import { Cake, Check, Copy, Phone } from "lucide-react";
import type { TeamMember } from "@/lib/database.types";
import {
  buildBirthdayMessage,
  copyToClipboard,
  daysUntilBirthday,
  formatBirthdayDisplay,
  formatPhone,
} from "@/lib/utils";

export function BirthdayList({
  members,
  emptyLabel = "Nenhum aniversariante neste período.",
}: {
  members: TeamMember[];
  emptyLabel?: string;
}) {
  const sorted = [...members]
    .filter((m) => m.birthday)
    .sort((a, b) => daysUntilBirthday(a.birthday!) - daysUntilBirthday(b.birthday!));

  if (!sorted.length) {
    return <p className="text-sm text-kadosh-beige-mid/60">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-2">
      {sorted.map((m) => (
        <BirthdayRow key={m.id} member={m} />
      ))}
    </ul>
  );
}

function BirthdayRow({ member }: { member: TeamMember }) {
  const [copied, setCopied] = useState(false);
  const days = daysUntilBirthday(member.birthday!);

  async function handleCopy() {
    await copyToClipboard(buildBirthdayMessage(member.full_name));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-kadosh-burnt/15 bg-kadosh-black/30 px-3.5 py-2.5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-kadosh-fire/15">
          <Cake className="h-4.5 w-4.5 text-kadosh-fire" />
        </div>
        <div>
          <p className="text-sm font-medium text-kadosh-beige-light">{member.full_name}</p>
          <p className="flex items-center gap-1.5 text-xs text-kadosh-beige-mid/60">
            <span>{formatBirthdayDisplay(member.birthday!)}</span>
            <span>•</span>
            <span>{days === 0 ? "hoje! 🎉" : days === 1 ? "amanhã" : `em ${days} dias`}</span>
            <span>•</span>
            <Phone className="h-3 w-3" />
            <span>{formatPhone(member.phone)}</span>
          </p>
        </div>
      </div>
      <button onClick={handleCopy} className="kadosh-btn-ghost shrink-0">
        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copiado" : "Mensagem"}
      </button>
    </li>
  );
}
