"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { INSTRUMENTS, MAIN_ROLES, MEMBER_STATUSES, VOICE_TYPES } from "@/lib/constants";
import type { MainRole, TeamMember } from "@/lib/database.types";

export function MemberForm({
  member,
  action,
}: {
  member?: TeamMember;
  action: (formData: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mainRole, setMainRole] = useState<MainRole>(member?.main_role ?? "Cantor");
  const [secondaryRoles, setSecondaryRoles] = useState<string[]>(member?.secondary_roles ?? []);

  const involvesSinger = mainRole === "Cantor" || secondaryRoles.includes("Cantor");
  const involvesMusician = mainRole === "Músico" || secondaryRoles.includes("Músico");

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await action(formData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao salvar.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="kadosh-card space-y-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="kadosh-label" htmlFor="full_name">Nome completo *</label>
          <input
            id="full_name"
            name="full_name"
            required
            defaultValue={member?.full_name}
            className="kadosh-input"
            placeholder="Ex: Bruna Oliveira"
          />
        </div>
        <div>
          <label className="kadosh-label" htmlFor="phone">Telefone / WhatsApp *</label>
          <input
            id="phone"
            name="phone"
            required
            defaultValue={member?.phone}
            className="kadosh-input"
            placeholder="(11) 91234-5678"
          />
        </div>
        <div>
          <label className="kadosh-label" htmlFor="birthday">Data de aniversário</label>
          <input
            id="birthday"
            name="birthday"
            type="date"
            defaultValue={member?.birthday ?? ""}
            className="kadosh-input"
          />
        </div>
        <div>
          <label className="kadosh-label" htmlFor="status">Status *</label>
          <select id="status" name="status" defaultValue={member?.status ?? "Ativo"} className="kadosh-input">
            {MEMBER_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="kadosh-label">Função principal *</label>
        <div className="flex flex-wrap gap-2">
          {MAIN_ROLES.map((role) => (
            <label
              key={role}
              className={`cursor-pointer rounded-xl border px-3.5 py-2 text-sm transition-colors ${
                mainRole === role
                  ? "border-kadosh-fire bg-kadosh-fire/15 text-kadosh-beige-light"
                  : "border-kadosh-burnt/25 text-kadosh-beige-mid/70 hover:border-kadosh-burnt/50"
              }`}
            >
              <input
                type="radio"
                name="main_role"
                value={role}
                checked={mainRole === role}
                onChange={() => setMainRole(role)}
                className="sr-only"
              />
              {role}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="kadosh-label">Função secundária (opcional)</label>
        <div className="flex flex-wrap gap-2">
          {MAIN_ROLES.filter((r) => r !== mainRole).map((role) => {
            const checked = secondaryRoles.includes(role);
            return (
              <label
                key={role}
                className={`cursor-pointer rounded-xl border px-3.5 py-2 text-sm transition-colors ${
                  checked
                    ? "border-kadosh-burnt bg-kadosh-burnt/15 text-kadosh-beige-light"
                    : "border-kadosh-burnt/25 text-kadosh-beige-mid/70 hover:border-kadosh-burnt/50"
                }`}
              >
                <input
                  type="checkbox"
                  name="secondary_roles"
                  value={role}
                  checked={checked}
                  onChange={() =>
                    setSecondaryRoles((prev) =>
                      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
                    )
                  }
                  className="sr-only"
                />
                {role}
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {involvesSinger && (
          <div>
            <label className="kadosh-label" htmlFor="voice_type">Tipo de voz</label>
            <select id="voice_type" name="voice_type" defaultValue={member?.voice_type ?? "Não se aplica"} className="kadosh-input">
              {VOICE_TYPES.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        )}
        {involvesMusician && (
          <div>
            <label className="kadosh-label" htmlFor="instrument">Instrumento</label>
            <select id="instrument" name="instrument" defaultValue={member?.instrument ?? "Não se aplica"} className="kadosh-input">
              {INSTRUMENTS.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="kadosh-label" htmlFor="notes">Observações</label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={member?.notes ?? ""}
          className="kadosh-input resize-none"
          placeholder="Alguma observação sobre esta pessoa..."
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => router.back()} className="kadosh-btn-secondary">
          Cancelar
        </button>
        <button type="submit" disabled={pending} className="kadosh-btn-primary">
          {pending ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
