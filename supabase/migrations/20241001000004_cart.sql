-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 004: Cart
-- AGENTS.md §12 — guest cart in localStorage (client), signed-in cart in DB
-- ─────────────────────────────────────────────────────────────────────────────

create table public.cart_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  -- Cart item points to a variant, not just a product (AGENTS.md §13)
  variant_id  uuid not null references public.product_variants(id) on delete cascade,
  quantity    int not null default 1 check (quantity > 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- One row per user+variant combination
  unique (user_id, variant_id)
);

comment on table public.cart_items is
  'Server-side cart for signed-in users. Guest cart lives in localStorage.';

create index idx_cart_items_user_id on public.cart_items(user_id);

create trigger trg_cart_items_updated_at
  before update on public.cart_items
  for each row execute function public.handle_updated_at();

-- ── RLS — AGENTS.md §8: users cannot read each other's carts ─────────────────
alter table public.cart_items enable row level security;

create policy "users_read_own_cart"
  on public.cart_items for select
  using (auth.uid() = user_id);

create policy "users_insert_own_cart"
  on public.cart_items for insert
  with check (auth.uid() = user_id);

create policy "users_update_own_cart"
  on public.cart_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and quantity > 0);

create policy "users_delete_own_cart"
  on public.cart_items for delete
  using (auth.uid() = user_id);

-- Admins can read all carts (for support)
create policy "admins_read_all_carts"
  on public.cart_items for select
  using (public.is_admin());
