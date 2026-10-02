-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 013: Store settings
-- Stores configurable store parameters like free shipping threshold
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.store_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz not null default now()
);

comment on table public.store_settings is
  'Key-value store for global store settings such as free delivery threshold.';

create trigger trg_store_settings_updated_at
  before update on public.store_settings
  for each row execute function public.handle_updated_at();

alter table public.store_settings enable row level security;

-- Anyone can read store settings (needed for cart banner, checkout)
create policy "public_read_store_settings"
  on public.store_settings for select
  using (true);

-- Only admins can insert or update settings
create policy "admins_insert_store_settings"
  on public.store_settings for insert
  with check (public.is_admin());

create policy "admins_update_store_settings"
  on public.store_settings for update
  using (public.is_admin())
  with check (public.is_admin());

-- Seed default free shipping threshold: ₦100,000 (10000000 kobo)
insert into public.store_settings (key, value, description)
values
  ('free_shipping_threshold_minor', '10000000'::jsonb, 'Free delivery threshold in minor units (kobo). E.g. 10000000 = ₦100,000')
on conflict (key) do nothing;
