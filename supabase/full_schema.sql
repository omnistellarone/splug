-- =============================================================================
-- SPLUG COMPLETE DATABASE SCHEMA (Phases 0 & 1)
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/qnjrvsigzdkazghsqfjr/sql/new
-- =============================================================================

-- =============================================================================
-- Migration 001: Extensions & triggers
-- =============================================================================
create extension if not exists "pgcrypto";

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.create_updated_at_trigger(table_name text)
returns void
language plpgsql
as $$
begin
  execute format(
    'create trigger trg_%I_updated_at
     before update on public.%I
     for each row execute function public.handle_updated_at()',
    table_name, table_name
  );
end;
$$;

-- =============================================================================
-- Migration 002: User roles & profiles
-- =============================================================================
create table if not exists public.user_roles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('admin', 'customer')),
  created_at  timestamptz not null default now(),
  unique (user_id, role)
);

comment on table public.user_roles is
  'Authoritative role assignments. Never trust client-side claims.';

create index if not exists idx_user_roles_user_id on public.user_roles(user_id);

alter table public.user_roles enable row level security;

drop policy if exists "users_read_own_role" on public.user_roles;
create policy "users_read_own_role"
  on public.user_roles for select
  using (auth.uid() = user_id);

create table if not exists public.profiles (
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

drop policy if exists "users_read_own_profile" on public.profiles;
create policy "users_read_own_profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "users_update_own_profile" on public.profiles;
create policy "users_update_own_profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "users_insert_own_profile" on public.profiles;
create policy "users_insert_own_profile"
  on public.profiles for insert
  with check (auth.uid() = id);

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

drop policy if exists "admins_read_all_profiles" on public.profiles;
create policy "admins_read_all_profiles"
  on public.profiles for select
  using (public.is_admin());

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

  insert into public.user_roles (user_id, role)
  values (new.id, 'customer')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- =============================================================================
-- Migration 003: Catalog (Categories, Brands, Products, Variants, Images)
-- =============================================================================
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  parent_id   uuid references public.categories(id) on delete set null,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_categories_slug on public.categories(slug);
create index if not exists idx_categories_parent_id on public.categories(parent_id);

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
  before update on public.categories
  for each row execute function public.handle_updated_at();

alter table public.categories enable row level security;

drop policy if exists "public_read_active_categories" on public.categories;
create policy "public_read_active_categories"
  on public.categories for select
  using (is_active = true);

drop policy if exists "admins_all_categories" on public.categories;
create policy "admins_all_categories"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

create table if not exists public.brands (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  logo_url    text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_brands_slug on public.brands(slug);

drop trigger if exists trg_brands_updated_at on public.brands;
create trigger trg_brands_updated_at
  before update on public.brands
  for each row execute function public.handle_updated_at();

alter table public.brands enable row level security;

drop policy if exists "public_read_active_brands" on public.brands;
create policy "public_read_active_brands"
  on public.brands for select
  using (is_active = true);

drop policy if exists "admins_all_brands" on public.brands;
create policy "admins_all_brands"
  on public.brands for all
  using (public.is_admin())
  with check (public.is_admin());

create table if not exists public.products (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text not null unique,
  description     text,
  category_id     uuid references public.categories(id) on delete set null,
  brand_id        uuid references public.brands(id) on delete set null,
  is_active       boolean not null default true,
  is_archived     boolean not null default false,
  meta_title      text,
  meta_description text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_brand_id on public.products(brand_id);
create index if not exists idx_products_is_active on public.products(is_active) where is_active = true;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

alter table public.products enable row level security;

drop policy if exists "public_read_active_products" on public.products;
create policy "public_read_active_products"
  on public.products for select
  using (is_active = true and is_archived = false);

drop policy if exists "admins_all_products" on public.products;
create policy "admins_all_products"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

create table if not exists public.product_variants (
  id                uuid primary key default gen_random_uuid(),
  product_id        uuid not null references public.products(id) on delete cascade,
  sku               text not null unique,
  price_minor       int not null check (price_minor >= 0),
  compare_at_minor  int check (compare_at_minor >= 0),
  options           jsonb not null default '{}'::jsonb,
  stock             int not null default 0 check (stock >= 0),
  is_active         boolean not null default true,
  weight_grams      int,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_product_variants_product_id on public.product_variants(product_id);
create index if not exists idx_product_variants_sku on public.product_variants(sku);
create index if not exists idx_product_variants_active on public.product_variants(product_id, is_active) where is_active = true;

drop trigger if exists trg_product_variants_updated_at on public.product_variants;
create trigger trg_product_variants_updated_at
  before update on public.product_variants
  for each row execute function public.handle_updated_at();

alter table public.product_variants enable row level security;

drop policy if exists "public_read_active_variants" on public.product_variants;
create policy "public_read_active_variants"
  on public.product_variants for select
  using (
    is_active = true and
    exists (
      select 1 from public.products p
      where p.id = product_id and p.is_active = true and p.is_archived = false
    )
  );

drop policy if exists "admins_all_variants" on public.product_variants;
create policy "admins_all_variants"
  on public.product_variants for all
  using (public.is_admin())
  with check (public.is_admin());

create table if not exists public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  variant_id  uuid references public.product_variants(id) on delete set null,
  storage_path text not null,
  alt_text    text,
  sort_order  int not null default 0,
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists idx_product_images_product_id on public.product_images(product_id);
create index if not exists idx_product_images_primary on public.product_images(product_id, is_primary) where is_primary = true;

alter table public.product_images enable row level security;

drop policy if exists "public_read_product_images" on public.product_images;
create policy "public_read_product_images"
  on public.product_images for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.is_active = true and p.is_archived = false
    )
  );

drop policy if exists "admins_all_product_images" on public.product_images;
create policy "admins_all_product_images"
  on public.product_images for all
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- Migration 004: Cart
-- =============================================================================
create table if not exists public.cart_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  variant_id  uuid not null references public.product_variants(id) on delete cascade,
  quantity    int not null default 1 check (quantity > 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, variant_id)
);

create index if not exists idx_cart_items_user_id on public.cart_items(user_id);

drop trigger if exists trg_cart_items_updated_at on public.cart_items;
create trigger trg_cart_items_updated_at
  before update on public.cart_items
  for each row execute function public.handle_updated_at();

alter table public.cart_items enable row level security;

drop policy if exists "users_read_own_cart" on public.cart_items;
create policy "users_read_own_cart"
  on public.cart_items for select
  using (auth.uid() = user_id);

drop policy if exists "users_insert_own_cart" on public.cart_items;
create policy "users_insert_own_cart"
  on public.cart_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "users_update_own_cart" on public.cart_items;
create policy "users_update_own_cart"
  on public.cart_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and quantity > 0);

drop policy if exists "users_delete_own_cart" on public.cart_items;
create policy "users_delete_own_cart"
  on public.cart_items for delete
  using (auth.uid() = user_id);

drop policy if exists "admins_read_all_carts" on public.cart_items;
create policy "admins_read_all_carts"
  on public.cart_items for select
  using (public.is_admin());

-- =============================================================================
-- Migration 005: Addresses
-- =============================================================================
create table if not exists public.addresses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  label         text,
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

create index if not exists idx_addresses_user_id on public.addresses(user_id);

drop trigger if exists trg_addresses_updated_at on public.addresses;
create trigger trg_addresses_updated_at
  before update on public.addresses
  for each row execute function public.handle_updated_at();

alter table public.addresses enable row level security;

drop policy if exists "users_read_own_addresses" on public.addresses;
create policy "users_read_own_addresses"
  on public.addresses for select
  using (auth.uid() = user_id);

drop policy if exists "users_insert_own_addresses" on public.addresses;
create policy "users_insert_own_addresses"
  on public.addresses for insert
  with check (auth.uid() = user_id);

drop policy if exists "users_update_own_addresses" on public.addresses;
create policy "users_update_own_addresses"
  on public.addresses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users_delete_own_addresses" on public.addresses;
create policy "users_delete_own_addresses"
  on public.addresses for delete
  using (auth.uid() = user_id);

drop policy if exists "admins_read_all_addresses" on public.addresses;
create policy "admins_read_all_addresses"
  on public.addresses for select
  using (public.is_admin());

create unique index if not exists idx_addresses_one_default
  on public.addresses(user_id)
  where is_default = true;

-- =============================================================================
-- Migration 006: Coupons
-- =============================================================================
create table if not exists public.coupons (
  id                uuid primary key default gen_random_uuid(),
  code              text not null unique,
  description       text,
  discount_type     text not null check (discount_type in ('percentage', 'fixed_minor')),
  discount_value    int not null check (discount_value > 0),
  min_order_minor   int not null default 0 check (min_order_minor >= 0),
  max_discount_minor int,
  max_uses          int,
  used_count        int not null default 0 check (used_count >= 0),
  max_uses_per_user int not null default 1,
  starts_at         timestamptz not null default now(),
  expires_at        timestamptz,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint coupon_uses_valid check (max_uses is null or used_count <= max_uses)
);

create index if not exists idx_coupons_code on public.coupons(code);
create index if not exists idx_coupons_active on public.coupons(is_active, expires_at) where is_active = true;

drop trigger if exists trg_coupons_updated_at on public.coupons;
create trigger trg_coupons_updated_at
  before update on public.coupons
  for each row execute function public.handle_updated_at();

alter table public.coupons enable row level security;

drop policy if exists "authenticated_read_active_coupons" on public.coupons;
create policy "authenticated_read_active_coupons"
  on public.coupons for select
  using (
    auth.uid() is not null
    and is_active = true
    and (expires_at is null or expires_at > now())
    and (max_uses is null or used_count < max_uses)
  );

drop policy if exists "admins_all_coupons" on public.coupons;
create policy "admins_all_coupons"
  on public.coupons for all
  using (public.is_admin())
  with check (public.is_admin());

create table if not exists public.coupon_uses (
  id          uuid primary key default gen_random_uuid(),
  coupon_id   uuid not null references public.coupons(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  order_id    uuid,
  used_at     timestamptz not null default now(),
  unique (coupon_id, user_id)
);

create index if not exists idx_coupon_uses_coupon_id on public.coupon_uses(coupon_id);
create index if not exists idx_coupon_uses_user_id on public.coupon_uses(user_id);

alter table public.coupon_uses enable row level security;

drop policy if exists "users_read_own_coupon_uses" on public.coupon_uses;
create policy "users_read_own_coupon_uses"
  on public.coupon_uses for select
  using (auth.uid() = user_id);

drop policy if exists "admins_all_coupon_uses" on public.coupon_uses;
create policy "admins_all_coupon_uses"
  on public.coupon_uses for all
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- Migration 007: Orders & Order Items
-- =============================================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum (
      'pending', 'payment_init', 'paid', 'processing',
      'shipped', 'delivered', 'cancelled', 'refunded'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum (
      'pending', 'initiated', 'paid', 'failed', 'refunded'
    );
  end if;
end;
$$;

create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete restrict,
  status              public.order_status not null default 'pending',
  payment_status      public.payment_status not null default 'pending',
  shipping_name       text not null,
  shipping_phone      text not null,
  shipping_address1   text not null,
  shipping_address2   text,
  shipping_city       text not null,
  shipping_state      text not null,
  shipping_country    text not null default 'NG',
  subtotal_minor      int not null check (subtotal_minor >= 0),
  shipping_minor      int not null default 0 check (shipping_minor >= 0),
  discount_minor      int not null default 0 check (discount_minor >= 0),
  total_minor         int not null check (total_minor >= 0),
  coupon_code         text,
  coupon_discount_minor int default 0,
  payment_reference   text unique,
  customer_note       text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_payment_reference on public.orders(payment_reference) where payment_reference is not null;

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.handle_updated_at();

alter table public.orders enable row level security;

drop policy if exists "users_read_own_orders" on public.orders;
create policy "users_read_own_orders"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "users_insert_own_orders" on public.orders;
create policy "users_insert_own_orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

drop policy if exists "admins_read_all_orders" on public.orders;
create policy "admins_read_all_orders"
  on public.orders for select
  using (public.is_admin());

drop policy if exists "admins_update_orders" on public.orders;
create policy "admins_update_orders"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

create table if not exists public.order_items (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references public.orders(id) on delete cascade,
  variant_id          uuid references public.product_variants(id) on delete set null,
  product_name        text not null,
  variant_sku         text not null,
  variant_options     jsonb not null default '{}'::jsonb,
  unit_price_minor    int not null check (unit_price_minor >= 0),
  quantity            int not null check (quantity > 0),
  line_total_minor    int not null check (line_total_minor >= 0),
  image_url           text,
  created_at          timestamptz not null default now()
);

create index if not exists idx_order_items_order_id on public.order_items(order_id);

alter table public.order_items enable row level security;

drop policy if exists "users_read_own_order_items" on public.order_items;
create policy "users_read_own_order_items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "admins_all_order_items" on public.order_items;
create policy "admins_all_order_items"
  on public.order_items for all
  using (public.is_admin())
  with check (public.is_admin());

create table if not exists public.order_status_history (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  from_status public.order_status,
  to_status   public.order_status not null,
  note        text,
  changed_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_order_status_history_order_id on public.order_status_history(order_id);

alter table public.order_status_history enable row level security;

drop policy if exists "users_read_own_order_history" on public.order_status_history;
create policy "users_read_own_order_history"
  on public.order_status_history for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "admins_all_order_history" on public.order_status_history;
create policy "admins_all_order_history"
  on public.order_status_history for all
  using (public.is_admin())
  with check (public.is_admin());

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'fk_coupon_uses_order_id'
  ) then
    alter table public.coupon_uses
      add constraint fk_coupon_uses_order_id
      foreign key (order_id) references public.orders(id) on delete set null;
  end if;
end;
$$;

-- =============================================================================
-- Migration 008: Payments & Inventory Movement & atomic finalize_payment function
-- =============================================================================
create table if not exists public.payment_records (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references public.orders(id) on delete restrict,
  paystack_reference  text not null unique,
  paystack_event_type text,
  amount_minor        int not null check (amount_minor >= 0),
  currency            text not null default 'NGN',
  status              public.payment_status not null default 'pending',
  raw_payload         jsonb,
  processed_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_payment_records_order_id on public.payment_records(order_id);
create index if not exists idx_payment_records_reference on public.payment_records(paystack_reference);

drop trigger if exists trg_payment_records_updated_at on public.payment_records;
create trigger trg_payment_records_updated_at
  before update on public.payment_records
  for each row execute function public.handle_updated_at();

alter table public.payment_records enable row level security;

drop policy if exists "users_read_own_payment_records" on public.payment_records;
create policy "users_read_own_payment_records"
  on public.payment_records for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "admins_read_all_payment_records" on public.payment_records;
create policy "admins_read_all_payment_records"
  on public.payment_records for select
  using (public.is_admin());

create table if not exists public.inventory_movements (
  id              uuid primary key default gen_random_uuid(),
  variant_id      uuid not null references public.product_variants(id) on delete cascade,
  order_id        uuid references public.orders(id) on delete set null,
  delta           int not null,
  reason          text not null check (
    reason in ('purchase', 'restock', 'adjustment', 'return', 'damaged')
  ),
  note            text,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_inventory_movements_variant_id on public.inventory_movements(variant_id);
create index if not exists idx_inventory_movements_order_id on public.inventory_movements(order_id) where order_id is not null;

alter table public.inventory_movements enable row level security;

drop policy if exists "admins_all_inventory_movements" on public.inventory_movements;
create policy "admins_all_inventory_movements"
  on public.inventory_movements for all
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.finalize_payment(
  p_order_id          uuid,
  p_paystack_reference text,
  p_amount_minor      int,
  p_event_type        text,
  p_raw_payload       jsonb
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_order       public.orders%rowtype;
  v_item        public.order_items%rowtype;
  v_record_id   uuid;
  v_already_processed boolean := false;
begin
  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'order_not_found');
  end if;

  select exists(
    select 1 from public.payment_records
    where paystack_reference = p_paystack_reference
      and status = 'paid'
      and processed_at is not null
  ) into v_already_processed;

  if v_already_processed then
    return jsonb_build_object('ok', true, 'idempotent', true);
  end if;

  if p_amount_minor <> v_order.total_minor then
    return jsonb_build_object(
      'ok', false,
      'error', 'amount_mismatch',
      'expected', v_order.total_minor,
      'received', p_amount_minor
    );
  end if;

  insert into public.payment_records (
    order_id, paystack_reference, paystack_event_type,
    amount_minor, status, raw_payload, processed_at
  )
  values (
    p_order_id, p_paystack_reference, p_event_type,
    p_amount_minor, 'paid', p_raw_payload, now()
  )
  on conflict (paystack_reference) do update set
    status       = 'paid',
    raw_payload  = excluded.raw_payload,
    processed_at = now(),
    updated_at   = now()
  returning id into v_record_id;

  update public.orders set
    status          = 'paid',
    payment_status  = 'paid',
    payment_reference = p_paystack_reference,
    updated_at      = now()
  where id = p_order_id;

  insert into public.order_status_history (order_id, from_status, to_status, note)
  values (p_order_id, v_order.status, 'paid', 'Payment verified via Paystack webhook');

  for v_item in
    select * from public.order_items where order_id = p_order_id
  loop
    if v_item.variant_id is not null then
      update public.product_variants
      set stock = stock - v_item.quantity,
          updated_at = now()
      where id = v_item.variant_id;

      insert into public.inventory_movements (
        variant_id, order_id, delta, reason, note
      ) values (
        v_item.variant_id, p_order_id,
        -v_item.quantity, 'purchase',
        'Order ' || p_order_id::text || ' paid'
      );
    end if;
  end loop;

  return jsonb_build_object('ok', true, 'idempotent', false);
end;
$$;

-- =============================================================================
-- Migration 009: Reviews & Wishlist
-- =============================================================================
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  order_id    uuid references public.orders(id) on delete set null,
  rating      int not null check (rating between 1 and 5),
  title       text,
  body        text,
  is_verified boolean not null default false,
  is_approved boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (product_id, user_id)
);

create index if not exists idx_reviews_product_id on public.reviews(product_id);
create index if not exists idx_reviews_user_id on public.reviews(user_id);
create index if not exists idx_reviews_approved on public.reviews(product_id, is_approved) where is_approved = true;

drop trigger if exists trg_reviews_updated_at on public.reviews;
create trigger trg_reviews_updated_at
  before update on public.reviews
  for each row execute function public.handle_updated_at();

alter table public.reviews enable row level security;

drop policy if exists "public_read_approved_reviews" on public.reviews;
create policy "public_read_approved_reviews"
  on public.reviews for select
  using (is_approved = true);

drop policy if exists "users_read_own_reviews" on public.reviews;
create policy "users_read_own_reviews"
  on public.reviews for select
  using (auth.uid() = user_id);

drop policy if exists "users_insert_own_reviews" on public.reviews;
create policy "users_insert_own_reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

drop policy if exists "users_update_own_reviews" on public.reviews;
create policy "users_update_own_reviews"
  on public.reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users_delete_own_reviews" on public.reviews;
create policy "users_delete_own_reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);

drop policy if exists "admins_all_reviews" on public.reviews;
create policy "admins_all_reviews"
  on public.reviews for all
  using (public.is_admin())
  with check (public.is_admin());

create table if not exists public.wishlist_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists idx_wishlist_items_user_id on public.wishlist_items(user_id);

alter table public.wishlist_items enable row level security;

drop policy if exists "users_read_own_wishlist" on public.wishlist_items;
create policy "users_read_own_wishlist"
  on public.wishlist_items for select
  using (auth.uid() = user_id);

drop policy if exists "users_insert_own_wishlist" on public.wishlist_items;
create policy "users_insert_own_wishlist"
  on public.wishlist_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "users_delete_own_wishlist" on public.wishlist_items;
create policy "users_delete_own_wishlist"
  on public.wishlist_items for delete
  using (auth.uid() = user_id);

-- =============================================================================
-- Migration 010: Storage bucket policies
-- =============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

drop policy if exists "public_read_product_images" on storage.objects;
create policy "public_read_product_images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "admins_upload_product_images" on storage.objects;
create policy "admins_upload_product_images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and public.is_admin()
  );

drop policy if exists "admins_update_product_images" on storage.objects;
create policy "admins_update_product_images"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and public.is_admin()
  );

drop policy if exists "admins_delete_product_images" on storage.objects;
create policy "admins_delete_product_images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and public.is_admin()
  );

-- =============================================================================
-- Migration 011: Seed data — categories & brands
-- =============================================================================
insert into public.categories (name, slug, description, sort_order) values
  ('Phones',      'phones',      'Smartphones and mobile devices',            1),
  ('Laptops',     'laptops',     'Laptops, notebooks, and ultrabooks',         2),
  ('Audio',       'audio',       'Headphones, speakers, and earbuds',          3),
  ('Gaming',      'gaming',      'Gaming consoles, accessories, and gear',     4),
  ('Smart Home',  'smart-home',  'Smart home devices and accessories',         5),
  ('Accessories', 'accessories', 'Cables, chargers, cases, and more',          6),
  ('Tablets',     'tablets',     'Tablets and e-readers',                      7),
  ('Cameras',     'cameras',     'Cameras, lenses, and photography gear',      8),
  ('Wearables',   'wearables',   'Smartwatches, fitness trackers, and bands',  9),
  ('Networking',  'networking',  'Routers, switches, and network accessories', 10)
on conflict (slug) do nothing;

insert into public.brands (name, slug) values
  ('Apple',     'apple'),
  ('Samsung',   'samsung'),
  ('Google',    'google'),
  ('Sony',      'sony'),
  ('LG',        'lg'),
  ('Lenovo',    'lenovo'),
  ('HP',        'hp'),
  ('Dell',      'dell'),
  ('Asus',      'asus'),
  ('Tecno',     'tecno'),
  ('Infinix',   'infinix'),
  ('Xiaomi',    'xiaomi'),
  ('OnePlus',   'oneplus'),
  ('JBL',       'jbl'),
  ('Bose',      'bose'),
  ('Jabra',     'jabra'),
  ('Anker',     'anker')
on conflict (slug) do nothing;
