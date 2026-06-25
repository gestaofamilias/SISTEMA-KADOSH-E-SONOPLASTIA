import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { MemberForm } from "../_components/member-form";
import { updateMember } from "../actions";
import { DeleteMemberButton } from "../_components/delete-member-button";

export default async function EditarMembroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: member } = await supabase.from("team_members").select("*").eq("id", id).single();

  if (!member) notFound();

  const boundUpdate = updateMember.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Editar pessoa"
        subtitle={member.full_name}
        actions={<DeleteMemberButton id={id} name={member.full_name} />}
      />
      <MemberForm member={member} action={boundUpdate} />
    </div>
  );
}
