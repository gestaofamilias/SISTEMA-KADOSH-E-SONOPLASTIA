import { ShieldAlert, Users, Workflow } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { getN8nWebhookUrl } from "../automacoes/actions";
import { WebhookForm } from "./_components/webhook-form";
import { UserRoleRow } from "./_components/user-role-row";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  if (profile?.role !== "Administrador") {
    return (
      <div className="kadosh-card flex flex-col items-center gap-3 p-10 text-center">
        <ShieldAlert className="h-8 w-8 text-kadosh-fire" />
        <p className="font-medium text-kadosh-beige-light">Acesso restrito</p>
        <p className="text-sm text-kadosh-beige-mid/60">
          Apenas administradores podem acessar as configurações do sistema.
        </p>
      </div>
    );
  }

  const [webhookUrl, { data: profiles }] = await Promise.all([
    getN8nWebhookUrl(),
    supabase.from("profiles").select("id, full_name, role").order("full_name"),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" subtitle="Webhook do n8n e permissões de usuários" />

      <div className="kadosh-card space-y-4 p-5">
        <p className="kadosh-section-title">
          <Workflow className="h-5 w-5 text-kadosh-fire" />
          Integração com n8n
        </p>
        <WebhookForm initialUrl={webhookUrl} />
      </div>

      <div className="kadosh-card space-y-4 p-5">
        <p className="kadosh-section-title">
          <Users className="h-5 w-5 text-kadosh-fire" />
          Usuários e permissões
        </p>
        <p className="text-xs text-kadosh-beige-mid/55">
          Para criar um novo usuário, adicione-o em Authentication → Users no painel do Supabase.
          Ele aparecerá aqui automaticamente para você definir o papel.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-kadosh-burnt/15 text-xs uppercase tracking-wide text-kadosh-beige-mid/50">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Papel</th>
              </tr>
            </thead>
            <tbody>
              {(profiles ?? []).map((p) => (
                <UserRoleRow key={p.id} userId={p.id} fullName={p.full_name || "—"} role={p.role} isSelf={p.id === user?.id} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
