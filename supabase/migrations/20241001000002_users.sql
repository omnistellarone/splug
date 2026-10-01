-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 002: User roles & profiles
-- AGENTS.md §9 — admin role lives in trusted server-side data
-- ─────────────────────────────────────────────────────────────────────────────

-- ── user_roles ──────────────────────────────────────────────────────────────
create table public.user_roles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('admin', 'customer')),
  created_at  timestamptz not null default now(),
  unique (user_id, role)
);

comment on table public.user_roles is
  'Authoritative role assignments. Never trust client-side claims.';

-- Index for fast role lookups per user
create index idx_user_roles_user_id on public.user_roles(user_id);

-- RLS: users can only read their own role; only DB functions/service-role can write
alter table public.user_roles enable row level security;

create policy "users_read_own_role"
  on public.user_roles for select
  using (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies — only service-role (admin client) may modify
-- This prevents self-promotion to admin. AGENTS.md §9.


-- ── profiles ────────────────────────────────────────────────────────────────
-- Extended user data beyond auth.users
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  avatar_url    text,
  phone         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.profiles is
  'Extended user profile data. 1-to-1 with auth.users.';

alter table public.profiles enable row level security;

create policy "users_read_own_profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "users_update_own_profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "users_insert_own_profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Admins can read all profiles (for order management)
create policy "admins_read_all_profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );

  -- Default role: customer
  insert into public.user_roles (user_id, role)
  values (new.id, 'customer');

  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Helper: check if current user is admin (used in RLS policies)
create or replace function public.is_admin()
returns boolean
language sql
security definer stable
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;
