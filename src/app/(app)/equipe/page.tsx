import Link from "next/link";
import { UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { BirthdayList } from "@/components/birthdays/birthday-list";
import { TeamList } from "./_components/team-list";

export default async function EquipePage() {
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("team_members")
    .select("*")
    .order("full_name", { ascending: true });

  const list = members ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Equipe"
        subtitle={`${list.length} pessoa${list.length === 1 ? "" : "s"} cadastrada${list.length === 1 ? "" : "s"}`}
        actions={
          <Link href="/equipe/novo" className="kadosh-btn-primary">
            <UserPlus className="h-4 w-4" />
            Cadastrar pessoa
          </Link>
        }
      />

      <TeamList members={list} />

      <div className="kadosh-card p-5">
        <h3 className="kadosh-section-title mb-4">🎂 Aniversariantes</h3>
        <BirthdayList members={list} />
      </div>
    </div>
  );
}
