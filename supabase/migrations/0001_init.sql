-- =====================================================================
-- Sistema Kadosh — schema inicial
-- Gestão de Louvor, Banda e Sonoplastia do Grupo Kadosh
-- =====================================================================
-- Rode este arquivo completo no SQL Editor do seu projeto Supabase
-- (Project > SQL Editor > New query > colar e Run).
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- profiles: papel de cada usuário autenticado (Administrador / Líder Kadosh / Operador)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'Operador'
    check (role in ('Administrador', 'Líder Kadosh', 'Operador')),
  member_id uuid, -- referência opcional para team_members (vínculo da conta com a pessoa da equipe)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Papel/permissão de cada usuário autenticado do Sistema Kadosh.';

-- Função auxiliar para checar o papel do usuário logado nas policies
create or replace function public.current_user_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin_or_leader()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select role in ('Administrador', 'Líder Kadosh') from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Cria automaticamente um profile (papel padrão Operador) quando um usuário se cadastra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    coalesce(new.raw_user_meta_data ->> 'role', 'Operador')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- team_members: equipe (cantores, músicos, técnico de som, datashow)
-- ---------------------------------------------------------------------
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  birthday date,
  main_role text not null
    check (main_role in ('Cantor', 'Músico', 'Técnico de som', 'Datashow')),
  secondary_roles text[] not null default '{}',
  voice_type text
    check (voice_type in ('Melodia', 'Soprano', 'Contralto', 'Tenor', 'Baixo', 'Back vocal', 'Não se aplica')),
  instrument text
    check (instrument in ('Violão', 'Guitarra', 'Teclado', 'Baixo', 'Bateria', 'Cajón', 'Saxofone', 'Outro', 'Não se aplica')),
  status text not null default 'Ativo'
    check (status in ('Ativo', 'Inativo', 'Indisponível temporariamente')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.team_members is 'Cadastro da equipe do Grupo Kadosh (cantores, músicos, técnica).';

create index if not exists team_members_main_role_idx on public.team_members (main_role);
create index if not exists team_members_status_idx on public.team_members (status);
create index if not exists team_members_birthday_idx on public.team_members (birthday);

alter table public.profiles
  add constraint profiles_member_id_fkey foreign key (member_id) references public.team_members (id) on delete set null;

-- ---------------------------------------------------------------------
-- worship_events: cultos da semana (quinta, sábado, domingo) e eventos especiais
-- ---------------------------------------------------------------------
create table if not exists public.worship_events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  weekday text
    check (weekday in ('Quinta-feira', 'Sábado', 'Domingo', 'Outro')),
  event_date date not null,
  event_time time not null,
  event_type text not null default 'Culto de Louvor'
    check (event_type in ('Culto de Ensino', 'Culto de Louvor', 'Culto de Celebração', 'EBD', 'Ensaio', 'Evento especial', 'Outro')),
  status text not null default 'Planejado'
    check (status in ('Planejado', 'Escala em montagem', 'Aguardando confirmação', 'Confirmado', 'Realizado', 'Cancelado')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.worship_events is 'Cultos da semana (quinta/sábado/domingo) e eventos especiais.';

create index if not exists worship_events_event_date_idx on public.worship_events (event_date);
create index if not exists worship_events_status_idx on public.worship_events (status);

-- ---------------------------------------------------------------------
-- schedules: escala de um culto
-- ---------------------------------------------------------------------
create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.worship_events (id) on delete cascade,
  status text not null default 'Rascunho'
    check (status in ('Rascunho', 'Aguardando confirmação', 'Confirmada', 'Realizada', 'Cancelada')),
  general_notes text,
  whatsapp_message text,
  n8n_sent boolean not null default false,
  confirmation_requested boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.schedules is 'Escala criada para um culto específico.';

create index if not exists schedules_event_id_idx on public.schedules (event_id);
create index if not exists schedules_status_idx on public.schedules (status);

-- ---------------------------------------------------------------------
-- schedule_members: pessoas escaladas dentro de uma escala
-- ---------------------------------------------------------------------
create table if not exists public.schedule_members (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.schedules (id) on delete cascade,
  member_id uuid not null references public.team_members (id) on delete cascade,
  role text not null
    check (role in ('Cantor', 'Músico', 'Técnico de som', 'Datashow')),
  voice_type text
    check (voice_type in ('Melodia', 'Soprano', 'Contralto', 'Tenor', 'Baixo', 'Back vocal', 'Não se aplica')),
  instrument text
    check (instrument in ('Violão', 'Guitarra', 'Teclado', 'Baixo', 'Bateria', 'Cajón', 'Saxofone', 'Outro', 'Não se aplica')),
  confirmation_status text not null default 'Pendente'
    check (confirmation_status in ('Pendente', 'Confirmado', 'Recusado', 'Substituído')),
  presence_status text not null default 'Pendente'
    check (presence_status in ('Pendente', 'Presente', 'Ausente')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (schedule_id, member_id, role)
);

comment on table public.schedule_members is 'Pessoas escaladas em cada escala, com função, status de confirmação e presença.';

create index if not exists schedule_members_schedule_id_idx on public.schedule_members (schedule_id);
create index if not exists schedule_members_member_id_idx on public.schedule_members (member_id);

-- ---------------------------------------------------------------------
-- weekly_songs: hinos definidos para cada culto/escala
-- ---------------------------------------------------------------------
create table if not exists public.weekly_songs (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid references public.schedules (id) on delete cascade,
  event_id uuid not null references public.worship_events (id) on delete cascade,
  song_order integer not null default 1,
  song_name text not null,
  key_tone text,
  lead_member_id uuid references public.team_members (id) on delete set null,
  singer_notes text,
  musician_notes text,
  datashow_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.weekly_songs is 'Hinos escolhidos para cada culto, em ordem, com tom e quem puxa.';

create index if not exists weekly_songs_event_id_idx on public.weekly_songs (event_id);
create index if not exists weekly_songs_schedule_id_idx on public.weekly_songs (schedule_id);

-- ---------------------------------------------------------------------
-- confirmation_logs: histórico de confirmações enviadas/recebidas
-- ---------------------------------------------------------------------
create table if not exists public.confirmation_logs (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.schedules (id) on delete cascade,
  member_id uuid not null references public.team_members (id) on delete cascade,
  phone text,
  message_sent text,
  confirmation_status text not null default 'Pendente'
    check (confirmation_status in ('Pendente', 'Confirmado', 'Recusado', 'Substituído')),
  response_text text,
  sent_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.confirmation_logs is 'Histórico de mensagens de confirmação enviadas e respostas recebidas.';

create index if not exists confirmation_logs_schedule_id_idx on public.confirmation_logs (schedule_id);
create index if not exists confirmation_logs_member_id_idx on public.confirmation_logs (member_id);

-- ---------------------------------------------------------------------
-- automation_logs: registro de envios para o n8n / automações
-- ---------------------------------------------------------------------
create table if not exists public.automation_logs (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid references public.schedules (id) on delete cascade,
  automation_type text not null default 'n8n_webhook',
  webhook_url text,
  payload jsonb,
  status text not null default 'Pendente'
    check (status in ('Pendente', 'Enviado', 'Erro')),
  response text,
  error_message text,
  created_at timestamptz not null default now()
);

comment on table public.automation_logs is 'Histórico de envios de escala para webhooks de automação (n8n).';

create index if not exists automation_logs_schedule_id_idx on public.automation_logs (schedule_id);

-- ---------------------------------------------------------------------
-- app_settings: configurações gerais (ex: URL do webhook n8n)
-- ---------------------------------------------------------------------
create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  setting_value text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.app_settings is 'Configurações gerais do sistema (chave/valor), ex: n8n_webhook_url.';

insert into public.app_settings (setting_key, setting_value)
values ('n8n_webhook_url', '')
on conflict (setting_key) do nothing;

-- =====================================================================
-- updated_at automático
-- =====================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'profiles', 'team_members', 'worship_events', 'schedules',
    'schedule_members', 'weekly_songs', 'app_settings'
  ])
  loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I; create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at();',
      t, t
    );
  end loop;
end $$;

-- =====================================================================
-- RLS — Row Level Security
-- Regra geral: qualquer usuário autenticado pode ler tudo (equipe pequena,
-- ambiente de confiança interno). Escrita é restrita por papel.
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.team_members enable row level security;
alter table public.worship_events enable row level security;
alter table public.schedules enable row level security;
alter table public.schedule_members enable row level security;
alter table public.weekly_songs enable row level security;
alter table public.confirmation_logs enable row level security;
alter table public.automation_logs enable row level security;
alter table public.app_settings enable row level security;

-- profiles
create policy "profiles_select_own_or_admin" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin_or_leader());

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_admin_manage" on public.profiles
  for all to authenticated
  using (public.current_user_role() = 'Administrador')
  with check (public.current_user_role() = 'Administrador');

-- team_members (Administrador / Líder Kadosh cadastram; todos autenticados leem)
create policy "team_members_select_all" on public.team_members
  for select to authenticated using (true);
create policy "team_members_write_admin_leader" on public.team_members
  for all to authenticated
  using (public.is_admin_or_leader())
  with check (public.is_admin_or_leader());

-- worship_events
create policy "worship_events_select_all" on public.worship_events
  for select to authenticated using (true);
create policy "worship_events_write_admin_leader" on public.worship_events
  for all to authenticated
  using (public.is_admin_or_leader())
  with check (public.is_admin_or_leader());

-- schedules
create policy "schedules_select_all" on public.schedules
  for select to authenticated using (true);
create policy "schedules_write_admin_leader" on public.schedules
  for all to authenticated
  using (public.is_admin_or_leader())
  with check (public.is_admin_or_leader());

-- schedule_members (Operador pode atualizar, ex: confirmar presença)
create policy "schedule_members_select_all" on public.schedule_members
  for select to authenticated using (true);
create policy "schedule_members_write_admin_leader" on public.schedule_members
  for insert to authenticated with check (public.is_admin_or_leader());
create policy "schedule_members_delete_admin_leader" on public.schedule_members
  for delete to authenticated using (public.is_admin_or_leader());
create policy "schedule_members_update_any_authenticated" on public.schedule_members
  for update to authenticated using (true) with check (true);

-- weekly_songs
create policy "weekly_songs_select_all" on public.weekly_songs
  for select to authenticated using (true);
create policy "weekly_songs_write_admin_leader" on public.weekly_songs
  for all to authenticated
  using (public.is_admin_or_leader())
  with check (public.is_admin_or_leader());

-- confirmation_logs
create policy "confirmation_logs_select_all" on public.confirmation_logs
  for select to authenticated using (true);
create policy "confirmation_logs_write_all_authenticated" on public.confirmation_logs
  for all to authenticated using (true) with check (true);

-- automation_logs
create policy "automation_logs_select_all" on public.automation_logs
  for select to authenticated using (true);
create policy "automation_logs_write_admin_leader" on public.automation_logs
  for all to authenticated
  using (public.is_admin_or_leader())
  with check (public.is_admin_or_leader());

-- app_settings
create policy "app_settings_select_all" on public.app_settings
  for select to authenticated using (true);
create policy "app_settings_write_admin" on public.app_settings
  for all to authenticated
  using (public.current_user_role() = 'Administrador')
  with check (public.current_user_role() = 'Administrador');

-- =====================================================================
-- Fim da migration inicial
-- =====================================================================
