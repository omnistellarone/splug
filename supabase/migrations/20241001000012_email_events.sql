-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 012: Email Events Log
-- PLAN.md §5.22, AGENTS.md §17 — Audit log for transactional emails
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.email_events (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid references public.orders(id) on delete set null,
  user_id             uuid references auth.users(id) on delete set null,
  recipient           text not null,
  template_key        text not null,
  provider_message_id text,
  status              text not null check (status in ('sent', 'failed', 'simulated')),
  error_message       text,
  created_at          timestamptz not null default now()
);

create index if not exists idx_email_events_order_id on public.email_events(order_id);
create index if not exists idx_email_events_user_id on public.email_events(user_id);

alter table public.email_events enable row level security;

create policy "admins_all_email_events"
  on public.email_events for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "users_read_own_email_events"
  on public.email_events for select
  using (auth.uid() = user_id);
