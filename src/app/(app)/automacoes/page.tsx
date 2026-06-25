import { Workflow } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateShort, formatPhone } from "@/lib/utils";
import type { Schedule, WorshipEvent } from "@/lib/database.types";

export default async function AutomacoesPage() {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("confirmation_logs")
    .select("*, team_members(full_name), schedules(*, worship_events(*))")
    .order("created_at", { ascending: false })
    .limit(200);

  const { data: automationLogs } = await supabase
    .from("automation_logs")
    .select("*")
    .order("created_at", { ascending: false });

  const latestAutomationByScheduleId = new Map<string, { status: string; error_message: string | null }>();
  (automationLogs ?? []).forEach((log) => {
    if (log.schedule_id && !latestAutomationByScheduleId.has(log.schedule_id)) {
      latestAutomationByScheduleId.set(log.schedule_id, { status: log.status, error_message: log.error_message });
    }
  });

  type LogRow = {
    id: string;
    schedule_id: string;
    phone: string | null;
    message_sent: string | null;
    confirmation_status: string;
    sent_at: string | null;
    response_text: string | null;
    team_members: { full_name: string } | null;
    schedules: (Schedule & { worship_events: WorshipEvent }) | null;
  };

  const rows = (logs ?? []) as unknown as LogRow[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automações"
        subtitle="Histórico de envios e confirmações preparados para o n8n / WhatsApp"
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={Workflow}
          title="Nenhum envio registrado ainda"
          description='Use o botão "Enviar para n8n" dentro de uma escala para começar a registrar os envios.'
        />
      ) : (
        <div className="kadosh-card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-kadosh-burnt/15 text-xs uppercase tracking-wide text-kadosh-beige-mid/50">
                <th className="px-4 py-3">Culto</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Pessoa</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">Status de envio</th>
                <th className="px-4 py-3">Confirmação</th>
                <th className="px-4 py-3">Enviado em</th>
                <th className="px-4 py-3">Erro</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const automation = latestAutomationByScheduleId.get(row.schedule_id);
                return (
                  <tr key={row.id} className="border-b border-kadosh-burnt/8 last:border-0">
                    <td className="px-4 py-3 text-kadosh-beige-light">{row.schedules?.worship_events.name ?? "—"}</td>
                    <td className="px-4 py-3 text-kadosh-beige-mid/80">
                      {row.schedules ? formatDateShort(row.schedules.worship_events.event_date) : "—"}
                    </td>
                    <td className="px-4 py-3 text-kadosh-beige-light">{row.team_members?.full_name ?? "—"}</td>
                    <td className="px-4 py-3 text-kadosh-beige-mid/80">{row.phone ? formatPhone(row.phone) : "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={automation?.status ?? "Pendente"} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.confirmation_status} />
                    </td>
                    <td className="px-4 py-3 text-kadosh-beige-mid/70">
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
