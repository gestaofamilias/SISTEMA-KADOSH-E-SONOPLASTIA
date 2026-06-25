import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EventsList } from "./_components/events-list";

export default async function CultosPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("worship_events")
    .select("*")
    .order("event_date", { ascending: true });

  return (
    <div>
      <PageHeader
        title="Cultos da Semana"
        subtitle="Quinta-feira, sábado e domingo são os cultos principais — você também pode cadastrar eventos especiais."
      />
      <EventsList events={events ?? []} />
    </div>
  );
}
