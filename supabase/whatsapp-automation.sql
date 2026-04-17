alter table public.message_queue
add column if not exists provider_message_id text;

alter table public.message_queue
add column if not exists provider_status text;

alter table public.message_queue
add column if not exists send_attempts integer not null default 0;

alter table public.message_queue
add column if not exists last_attempt_at timestamptz;

create index if not exists idx_message_queue_provider_message_id
on public.message_queue(provider_message_id);
