-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 009: Reviews & Wishlist
-- ─────────────────────────────────────────────────────────────────────────────

-- ── reviews ───────────────────────────────────────────────────────────────────
create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  order_id    uuid references public.orders(id) on delete set null,
  rating      int not null check (rating between 1 and 5),
  title       text,
  body        text,
  is_verified boolean not null default false,  -- verified purchase
  is_approved boolean not null default false,  -- admin moderation
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- One review per user per product
  unique (product_id, user_id)
);

create index idx_reviews_product_id on public.reviews(product_id);
create index idx_reviews_user_id on public.reviews(user_id);
create index idx_reviews_approved on public.reviews(product_id, is_approved) where is_approved = true;

create trigger trg_reviews_updated_at
  before update on public.reviews
  for each row execute function public.handle_updated_at();

alter table public.reviews enable row level security;

-- Public can read approved reviews
create policy "public_read_approved_reviews"
  on public.reviews for select
  using (is_approved = true);

-- Authenticated users can read their own (even unapproved)
create policy "users_read_own_reviews"
  on public.reviews for select
  using (auth.uid() = user_id);

-- Users can insert their own reviews (one per product enforced by unique constraint)
create policy "users_insert_own_reviews"
  on public.reviews for insert
  with check (
    auth.uid() = user_id
    -- Users cannot write another user's review. AGENTS.md §8.
  );

create policy "users_update_own_reviews"
  on public.reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users_delete_own_reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);

create policy "admins_all_reviews"
  on public.reviews for all
  using (public.is_admin())
  with check (public.is_admin());


-- ── wishlists ─────────────────────────────────────────────────────────────────
create table public.wishlist_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

create index idx_wishlist_items_user_id on public.wishlist_items(user_id);

alter table public.wishlist_items enable row level security;

create policy "users_read_own_wishlist"
  on public.wishlist_items for select
  using (auth.uid() = user_id);

create policy "users_insert_own_wishlist"
  on public.wishlist_items for insert
  with check (auth.uid() = user_id);

create policy "users_delete_own_wishlist"
  on public.wishlist_items for delete
  using (auth.uid() = user_id);
