import Link from "next/link";
import { Workflow } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateShort, formatPhone } from "@/lib/utils";
import type { Schedule, WorshipEvent } from "@/lib/database.types";

interface SearchParams {
  tipo?: string;
  status?: string;
}

export default async function AutomacoesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { tipo, status: statusFilter } = await searchParams;
  const filterType = tipo || "todos";
  const filterStatus = statusFilter || "todos";

  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("confirmation_logs")
    .select("*, team_members(full_name, main_role), schedules(*, worship_events(*), schedule_members(member_id, role))")
    .order("created_at", { ascending: false })
    .limit(200);

  const { data: automationLogs } = await supabase
    .from("automation_logs")
    .select("*")
    .order("created_at", { ascending: false });

  const latestAutomationMap = new Map<string, { status: string; error_message: string | null }>();
  (automationLogs ?? []).forEach((log) => {
    if (log.schedule_id) {
      const key = `${log.schedule_id}_${log.automation_type}`;
      if (!latestAutomationMap.has(key)) {
        latestAutomationMap.set(key, { status: log.status, error_message: log.error_message });
      }
    }
  });

  type LogRow = {
    id: string;
    schedule_id: string;
    member_id: string;
    phone: string | null;
    message_sent: string | null;
    confirmation_status: string;
    sent_at: string | null;
    response_text: string | null;
    team_members: { full_name: string; main_role: string } | null;
    schedules: (Schedule & {
      worship_events: WorshipEvent;
      schedule_members: Array<{ member_id: string; role: string }>;
    }) | null;
  };

  const rows = (logs ?? []) as unknown as LogRow[];

  // Processar e filtrar linhas
  const processedRows = rows.map((row) => {
    const scheduleMembers = row.schedules?.schedule_members || [];
    const matchedMember = scheduleMembers.find((sm) => sm.member_id === row.member_id);
    const role = matchedMember?.role || row.team_members?.main_role || "Outro";
    const isTech = role === "Técnico de som" || role === "Datashow";
    return {
      ...row,
      isTech,
      roleName: role,
    };
  });

  const rowsWithAutomation = processedRows.map((row) => {
    const autoKey = `${row.schedule_id}_${row.isTech ? "n8n_webhook_technical" : "n8n_webhook"}`;
    const automation = latestAutomationMap.get(autoKey);
    return { ...row, automation };
  });

  const filteredRows = rowsWithAutomation.filter((row) => {
    if (filterType === "louvor" && row.isTech) return false;
    if (filterType === "tecnica" && !row.isTech) return false;

    if (filterStatus === "pendentes" && row.automation) return false;
    if (filterStatus === "enviados" && row.automation?.status !== "Enviado") return false;
    if (filterStatus === "erros" && row.automation?.status !== "Erro") return false;
    if (filterStatus === "confirmados" && row.confirmation_status !== "Confirmado") return false;
    if (filterStatus === "recusados" && row.confirmation_status !== "Recusado") return false;

    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automações"
        subtitle="Histórico de envios e confirmações preparados para o n8n / WhatsApp"
      />

      {/* Filtros por tipo de escala (Somente técnica / Escala completa) */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: "todos", label: "Todos" },
          { value: "louvor", label: "Escala completa" },
          { value: "tecnica", label: "Somente técnica" },
        ].map((opt) => (
          <Link
            key={opt.value}
            href={`/automacoes?tipo=${opt.value}&status=${filterStatus}`}
            className={`rounded-xl px-4 py-2 text-xs font-semibold border transition-all ${
              filterType === opt.value
                ? "border-kadosh-fire/40 bg-kadosh-fire/10 text-kadosh-beige-light font-bold"
                : "border-kadosh-burnt/15 bg-white/[0.02] text-kadosh-beige-mid/70 hover:bg-white/[0.04]"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Filtros por status de envio/confirmação */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: "todos", label: "Todos" },
          { value: "pendentes", label: "Pendentes" },
          { value: "enviados", label: "Enviados" },
          { value: "erros", label: "Erros" },
          { value: "confirmados", label: "Confirmados" },
          { value: "recusados", label: "Recusados" },
        ].map((opt) => (
          <Link
            key={opt.value}
            href={`/automacoes?tipo=${filterType}&status=${opt.value}`}
            className={`kadosh-tag transition-all ${
              filterStatus === opt.value
                ? "border-kadosh-fire/40 bg-kadosh-fire/10 text-kadosh-fire"
                : "hover:bg-white/[0.06]"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {filteredRows.length === 0 ? (
        <EmptyState
          icon={Workflow}
          title="Nenhum envio registrado para este filtro"
          description='Use os botões de disparo de WhatsApp nas escalas ou na sonoplastia para registrar os envios.'
        />
      ) : (
        <div className="kadosh-card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-kadosh-burnt/15 text-xs uppercase tracking-wide text-kadosh-beige-mid/50">
                <th className="px-4 py-3">Culto</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Pessoa</th>
                <th className="px-4 py-3">Função</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">Envio</th>
                <th className="px-4 py-3">Confirmação</th>
                <th className="px-4 py-3">Resposta</th>
                <th className="px-4 py-3">Enviado em</th>
                <th className="px-4 py-3">Erro</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => {
                const automation = row.automation;
                return (
                  <tr key={row.id} className="border-b border-kadosh-burnt/8 last:border-0">
                    <td className="px-4 py-3 text-kadosh-beige-light">{row.schedules?.worship_events.name ?? "—"}</td>
                    <td className="px-4 py-3 text-kadosh-beige-mid/80">
                      {row.schedules ? formatDateShort(row.schedules.worship_events.event_date) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`kadosh-tag ${
                          row.isTech
                            ? "border-kadosh-burnt/25 bg-kadosh-burnt/5 text-kadosh-burnt"
                            : "border-kadosh-fire/25 bg-kadosh-fire/5 text-kadosh-fire"
                        }`}
                      >
                        {row.isTech ? "Técnica" : "Louvor"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-kadosh-beige-light">{row.team_members?.full_name ?? "—"}</td>
                    <td className="px-4 py-3 text-kadosh-beige-mid/70 text-xs font-mono">{row.roleName}</td>
                    <td className="px-4 py-3 text-kadosh-beige-mid/80">{row.phone ? formatPhone(row.phone) : "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={automation?.status ?? "Pendente"} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.confirmation_status} />
                    </td>
                    <td className="px-4 py-3 max-w-[160px] truncate text-kadosh-beige-mid/70 text-xs" title={row.response_text ?? ""}>
                      {row.response_text ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-kadosh-beige-mid/70 text-xs">
                      {row.sent_at ? new Date(row.sent_at).toLocaleString("pt-BR") : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-red-400">{automation?.error_message ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
