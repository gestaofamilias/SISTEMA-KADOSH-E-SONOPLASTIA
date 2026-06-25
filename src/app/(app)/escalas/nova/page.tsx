import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { NewScheduleForm } from "../_components/new-schedule-form";

export default async function NovaEscalaPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("worship_events")
    .select("*")
    .neq("status", "Cancelado")
    .order("event_date", { ascending: true });

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Nova escala" subtitle="Escolha o culto para começar a montar a escala" />
      <NewScheduleForm events={events ?? []} />
    </div>
  );
}
