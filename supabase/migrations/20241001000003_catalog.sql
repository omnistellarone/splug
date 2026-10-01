-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 003: Catalog — categories, brands, products, variants, images
-- AGENTS.md §13 — variants own SKU, price, stock, active state
-- ─────────────────────────────────────────────────────────────────────────────

-- ── categories ──────────────────────────────────────────────────────────────
create table public.categories (
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

create index idx_categories_slug on public.categories(slug);
create index idx_categories_parent_id on public.categories(parent_id);

create trigger trg_categories_updated_at
  before update on public.categories
  for each row execute function public.handle_updated_at();

alter table public.categories enable row level security;

-- Public can read active categories
create policy "public_read_active_categories"
  on public.categories for select
  using (is_active = true);

-- Admins can do anything
create policy "admins_all_categories"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());


-- ── brands ───────────────────────────────────────────────────────────────────
create table public.brands (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  logo_url    text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_brands_slug on public.brands(slug);

create trigger trg_brands_updated_at
  before update on public.brands
  for each row execute function public.handle_updated_at();

alter table public.brands enable row level security;

create policy "public_read_active_brands"
  on public.brands for select
  using (is_active = true);

create policy "admins_all_brands"
  on public.brands for all
  using (public.is_admin())
  with check (public.is_admin());


-- ── products ─────────────────────────────────────────────────────────────────
create table public.products (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text not null unique,
  description     text,
  category_id     uuid references public.categories(id) on delete set null,
  brand_id        uuid references public.brands(id) on delete set null,
  is_active       boolean not null default true,
  is_archived     boolean not null default false,
  -- SEO
  meta_title      text,
  meta_description text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_products_slug on public.products(slug);
create index idx_products_category_id on public.products(category_id);
create index idx_products_brand_id on public.products(brand_id);
create index idx_products_is_active on public.products(is_active) where is_active = true;

create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

alter table public.products enable row level security;

-- Public can read non-archived active products
create policy "public_read_active_products"
  on public.products for select
  using (is_active = true and is_archived = false);

create policy "admins_all_products"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());


-- ── product_variants ─────────────────────────────────────────────────────────
-- Variants own: SKU, price, stock, options (AGENTS.md §13)
create table public.product_variants (
  id                uuid primary key default gen_random_uuid(),
  product_id        uuid not null references public.products(id) on delete cascade,
  sku               text not null unique,
  -- Price in integer minor units (kobo for NGN). AGENTS.md §11.
  price_minor       int not null check (price_minor >= 0),
  compare_at_minor  int check (compare_at_minor >= 0),
  -- Structured option attributes e.g. {"color": "black", "storage": "256GB"}
  options           jsonb not null default '{}'::jsonb,
  stock             int not null default 0 check (stock >= 0),
  is_active         boolean not null default true,
  weight_grams      int,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_product_variants_product_id on public.product_variants(product_id);
create index idx_product_variants_sku on public.product_variants(sku);
create index idx_product_variants_active on public.product_variants(product_id, is_active) where is_active = true;

create trigger trg_product_variants_updated_at
  before update on public.product_variants
  for each row execute function public.handle_updated_at();

alter table public.product_variants enable row level security;

create policy "public_read_active_variants"
  on public.product_variants for select
  using (
    is_active = true and
    exists (
      select 1 from public.products p
      where p.id = product_id and p.is_active = true and p.is_archived = false
    )
  );

create policy "admins_all_variants"
  on public.product_variants for all
  using (public.is_admin())
  with check (public.is_admin());


-- ── product_images ────────────────────────────────────────────────────────────
create table public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  -- Optional variant association — null = applies to all variants
  variant_id  uuid references public.product_variants(id) on delete set null,
  -- Storage object path (relative to bucket)
  storage_path text not null,
  alt_text    text,
  sort_order  int not null default 0,
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_product_images_product_id on public.product_images(product_id);
create index idx_product_images_primary on public.product_images(product_id, is_primary) where is_primary = true;

alter table public.product_images enable row level security;

create policy "public_read_product_images"
  on public.product_images for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.is_active = true and p.is_archived = false
    )
  );

create policy "admins_all_product_images"
  on public.product_images for all
  using (public.is_admin())
  with check (public.is_admin());
