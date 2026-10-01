-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 006: Coupons
-- ─────────────────────────────────────────────────────────────────────────────

create table public.coupons (
  id                uuid primary key default gen_random_uuid(),
  code              text not null unique,
  description       text,
  -- Discount type: 'percentage' or 'fixed_minor' (fixed = kobo amount)
  discount_type     text not null check (discount_type in ('percentage', 'fixed_minor')),
  -- For percentage: 0-100. For fixed: amount in minor units (kobo)
  discount_value    int not null check (discount_value > 0),
  -- Minimum cart value in minor units to apply coupon
  min_order_minor   int not null default 0 check (min_order_minor >= 0),
  -- Max discount cap in minor units (null = no cap)
  max_discount_minor int,
  -- Usage limits
  max_uses          int,        -- null = unlimited
  used_count        int not null default 0 check (used_count >= 0),
  -- Per-user limit
  max_uses_per_user int not null default 1,
  -- Validity window
  starts_at         timestamptz not null default now(),
  expires_at        timestamptz,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- Integrity: max_uses >= used_count when max_uses is not null
  constraint coupon_uses_valid check (max_uses is null or used_count <= max_uses)
);

create index idx_coupons_code on public.coupons(code);
create index idx_coupons_active on public.coupons(is_active, expires_at) where is_active = true;

create trigger trg_coupons_updated_at
  before update on public.coupons
  for each row execute function public.handle_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.coupons enable row level security;

-- Any authenticated user can look up a coupon by code (needed for checkout validation)
-- But only limited fields are visible — code, discount, validity
create policy "authenticated_read_active_coupons"
  on public.coupons for select
  using (
    auth.uid() is not null
    and is_active = true
    and (expires_at is null or expires_at > now())
    and (max_uses is null or used_count < max_uses)
  );

create policy "admins_all_coupons"
  on public.coupons for all
  using (public.is_admin())
  with check (public.is_admin());


-- ── coupon_uses: tracks per-user coupon redemptions ──────────────────────────
create table public.coupon_uses (
  id          uuid primary key default gen_random_uuid(),
  coupon_id   uuid not null references public.coupons(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  order_id    uuid,   -- FK added after orders table exists (migration 007)
  used_at     timestamptz not null default now(),
  unique (coupon_id, user_id)  -- enforces max_uses_per_user = 1 at DB level
);

create index idx_coupon_uses_coupon_id on public.coupon_uses(coupon_id);
create index idx_coupon_uses_user_id on public.coupon_uses(user_id);

alter table public.coupon_uses enable row level security;

-- Users can only see their own coupon uses
create policy "users_read_own_coupon_uses"
  on public.coupon_uses for select
  using (auth.uid() = user_id);

create policy "admins_all_coupon_uses"
  on public.coupon_uses for all
  using (public.is_admin())
  with check (public.is_admin());
