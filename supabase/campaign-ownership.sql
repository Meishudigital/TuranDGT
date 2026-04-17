alter table public.message_campaigns
add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists idx_message_campaigns_user_id
on public.message_campaigns(user_id);

create index if not exists idx_message_queue_campaign_id
on public.message_queue(campaign_id);
