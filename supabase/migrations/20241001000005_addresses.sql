-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 005: Addresses
-- AGENTS.md §8 — users cannot read each other's addresses
-- ─────────────────────────────────────────────────────────────────────────────

create table public.addresses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  label         text,                       -- e.g. "Home", "Office"
  full_name     text not null,
  phone         text not null,
  address_line1 text not null,
  address_line2 text,
  city          text not null,
  state         text not null,
  country       text not null default 'NG',
  is_default    boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_addresses_user_id on public.addresses(user_id);

create trigger trg_addresses_updated_at
  before update on public.addresses
  for each row execute function public.handle_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.addresses enable row level security;

create policy "users_read_own_addresses"
  on public.addresses for select
  using (auth.uid() = user_id);

create policy "users_insert_own_addresses"
  on public.addresses for insert
  with check (auth.uid() = user_id);

create policy "users_update_own_addresses"
  on public.addresses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users_delete_own_addresses"
  on public.addresses for delete
  using (auth.uid() = user_id);

-- Admins read all (for order fulfillment support)
create policy "admins_read_all_addresses"
  on public.addresses for select
  using (public.is_admin());

-- Enforce only one default address per user
create unique index idx_addresses_one_default
  on public.addresses(user_id)
  where is_default = true;
