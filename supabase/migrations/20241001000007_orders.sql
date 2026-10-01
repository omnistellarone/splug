-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 007: Orders
-- AGENTS.md §10 — orders contain snapshots; §11 — all money in minor units
-- ─────────────────────────────────────────────────────────────────────────────

create type public.order_status as enum (
  'pending',        -- created, not yet paid
  'payment_init',   -- Paystack initialized
  'paid',           -- payment verified by webhook
  'processing',     -- being picked/packed
  'shipped',        -- dispatched
  'delivered',      -- confirmed delivered
  'cancelled',      -- cancelled before ship
  'refunded'        -- refund processed
);

create type public.payment_status as enum (
  'pending',
  'initiated',
  'paid',
  'failed',
  'refunded'
);

-- ── orders ────────────────────────────────────────────────────────────────────
create table public.orders (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete restrict,
  status              public.order_status not null default 'pending',
  payment_status      public.payment_status not null default 'pending',

  -- Delivery address snapshot (not FK — addresses can be deleted after ordering)
  shipping_name       text not null,
  shipping_phone      text not null,
  shipping_address1   text not null,
  shipping_address2   text,
  shipping_city       text not null,
  shipping_state      text not null,
  shipping_country    text not null default 'NG',

  -- Totals — all in minor units (kobo). AGENTS.md §11.
  subtotal_minor      int not null check (subtotal_minor >= 0),
  shipping_minor      int not null default 0 check (shipping_minor >= 0),
  discount_minor      int not null default 0 check (discount_minor >= 0),
  total_minor         int not null check (total_minor >= 0),

  -- Coupon applied (snapshot of code + value)
  coupon_code         text,
  coupon_discount_minor int default 0,

  -- Paystack payment reference
  payment_reference   text unique,

  -- Notes
  customer_note       text,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_orders_user_id on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_payment_reference on public.orders(payment_reference) where payment_reference is not null;

create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.handle_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.orders enable row level security;

-- Users read only their own orders
create policy "users_read_own_orders"
  on public.orders for select
  using (auth.uid() = user_id);

-- Users can insert their own orders (server validates totals)
create policy "users_insert_own_orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- Users cannot update orders — only service-role (webhook) may change status/payment
-- This prevents users from marking their own order as paid. AGENTS.md §16.

-- Admins can read + update all orders
create policy "admins_read_all_orders"
  on public.orders for select
  using (public.is_admin());

create policy "admins_update_orders"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());


-- ── order_items ───────────────────────────────────────────────────────────────
-- Snapshot of product/variant at time of purchase. AGENTS.md §10.
create table public.order_items (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references public.orders(id) on delete cascade,
  -- Keep FK for reference but store snapshot in case variant is later archived
  variant_id          uuid references public.product_variants(id) on delete set null,
  -- Snapshots — never rely on current product data for historical orders
  product_name        text not null,
  variant_sku         text not null,
  variant_options     jsonb not null default '{}'::jsonb,
  -- Price in minor units at time of purchase
  unit_price_minor    int not null check (unit_price_minor >= 0),
  quantity            int not null check (quantity > 0),
  line_total_minor    int not null check (line_total_minor >= 0),
  -- Image snapshot
  image_url           text,
  created_at          timestamptz not null default now()
);

create index idx_order_items_order_id on public.order_items(order_id);

alter table public.order_items enable row level security;

-- Users can read their own order items (via orders join)
create policy "users_read_own_order_items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "admins_all_order_items"
  on public.order_items for all
  using (public.is_admin())
  with check (public.is_admin());


-- ── order_status_history ──────────────────────────────────────────────────────
create table public.order_status_history (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  from_status public.order_status,
  to_status   public.order_status not null,
  note        text,
  changed_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index idx_order_status_history_order_id on public.order_status_history(order_id);

alter table public.order_status_history enable row level security;

create policy "users_read_own_order_history"
  on public.order_status_history for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "admins_all_order_history"
  on public.order_status_history for all
  using (public.is_admin())
  with check (public.is_admin());


-- ── Add FK from coupon_uses to orders (now that orders exists) ────────────────
alter table public.coupon_uses
  add constraint fk_coupon_uses_order_id
  foreign key (order_id) references public.orders(id) on delete set null;
