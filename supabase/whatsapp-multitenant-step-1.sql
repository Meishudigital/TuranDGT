create table if not exists public.whatsapp_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  connection_name text,
  business_name text,
  display_phone_number text,
  waba_id text,
  phone_number_id text,
  access_token text,
  token_expires_at timestamptz,
  template_name text,
  template_language text not null default 'tr',
  webhook_subscribed boolean not null default false,
  status text not null default 'disconnected',
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint whatsapp_integrations_status_check check (
    status in ('disconnected', 'pending', 'connected', 'expired', 'error')
  ),
  constraint whatsapp_integrations_user_id_unique unique (user_id),
  constraint whatsapp_integrations_phone_number_id_unique unique (phone_number_id)
);

create index if not exists idx_whatsapp_integrations_user_id
on public.whatsapp_integrations(user_id);

create index if not exists idx_whatsapp_integrations_status
on public.whatsapp_integrations(status);

alter table public.message_campaigns
add column if not exists integration_id uuid references public.whatsapp_integrations(id) on delete set null;

create index if not exists idx_message_campaigns_integration_id
on public.message_campaigns(integration_id);

alter table public.message_queue
add column if not exists integration_id uuid references public.whatsapp_integrations(id) on delete set null;

create index if not exists idx_message_queue_integration_id
on public.message_queue(integration_id);

alter table public.whatsapp_integrations enable row level security;

drop policy if exists "read own whatsapp integrations" on public.whatsapp_integrations;
create policy "read own whatsapp integrations"
on public.whatsapp_integrations
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "insert own whatsapp integrations" on public.whatsapp_integrations;
create policy "insert own whatsapp integrations"
on public.whatsapp_integrations
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "update own whatsapp integrations" on public.whatsapp_integrations;
create policy "update own whatsapp integrations"
on public.whatsapp_integrations
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "delete own whatsapp integrations" on public.whatsapp_integrations;
create policy "delete own whatsapp integrations"
on public.whatsapp_integrations
for delete
to authenticated
using (auth.uid() = user_id);
