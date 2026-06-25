-- =====================================================================
-- Sistema Kadosh — módulo Sonoplastia
-- Adiciona observações técnicas na escala e checklist técnico por culto.
-- =====================================================================
-- Rode este arquivo completo no SQL Editor do seu projeto Supabase
-- (Project > SQL Editor > New query > colar e Run), depois da 0001_init.sql.
-- =====================================================================

alter table public.schedules
  add column if not exists technical_notes text;

comment on column public.schedules.technical_notes is 'Observações técnicas (som/datashow) específicas da escala, separadas das observações gerais.';

-- ---------------------------------------------------------------------
-- technical_checklists: checklist técnico simples por escala/culto
-- ---------------------------------------------------------------------
create table if not exists public.technical_checklists (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.schedules (id) on delete cascade,
  event_id uuid not null references public.worship_events (id) on delete cascade,
  sound_checked boolean not null default false,
  microphones_checked boolean not null default false,
  datashow_checked boolean not null default false,
  lyrics_ready boolean not null default false,
  playback_checked boolean not null default false,
  cables_checked boolean not null default false,
  notes text,
  status text not null default 'Pendente'
    check (status in ('Pendente', 'Em andamento', 'Concluído', 'Com problema')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (schedule_id)
);

comment on table public.technical_checklists is 'Checklist técnico simples (som, microfones, datashow, letras, playback, cabos) por escala.';

create index if not exists technical_checklists_schedule_id_idx on public.technical_checklists (schedule_id);
create index if not exists technical_checklists_event_id_idx on public.technical_checklists (event_id);

drop trigger if exists set_updated_at on public.technical_checklists;
create trigger set_updated_at
  before update on public.technical_checklists
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- RLS — mesmo padrão de public.schedules
-- ---------------------------------------------------------------------
alter table public.technical_checklists enable row level security;

create policy "technical_checklists_select_all" on public.technical_checklists
  for select to authenticated using (true);
create policy "technical_checklists_write_admin_leader" on public.technical_checklists
  for all to authenticated
  using (public.is_admin_or_leader())
  with check (public.is_admin_or_leader());

-- =====================================================================
-- Fim da migration de sonoplastia
-- =====================================================================
