import { PageHeader } from "@/components/ui/page-header";
import { MemberForm } from "../_components/member-form";
import { createMember } from "../actions";

export default function NovoMembroPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Cadastrar pessoa" subtitle="Adicione um novo integrante à equipe do Kadosh" />
      <MemberForm action={createMember} />
    </div>
  );
}
