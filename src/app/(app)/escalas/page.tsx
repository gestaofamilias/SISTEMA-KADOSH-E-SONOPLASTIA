import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { SchedulesList, type ScheduleWithRelations } from "./_components/schedules-list";

export default async function EscalasPage() {
  const supabase = await createClient();
  const { data: schedules } = await supabase
    .from("schedules")
    .select("*, worship_events(*), schedule_members(*)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Escalas"
        subtitle="Monte a escala de cada culto: cantores, músicos e técnica"
        actions={
          <Link href="/escalas/nova" className="kadosh-btn-primary">
            <Plus className="h-4 w-4" />
            Nova escala
          </Link>
        }
      />
      <SchedulesList schedules={(schedules ?? []) as unknown as ScheduleWithRelations[]} />
    </div>
  );
}
