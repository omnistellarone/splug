-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 010: Storage bucket policies
-- AGENTS.md §19 — admin-only writes, public reads for catalog images
-- ─────────────────────────────────────────────────────────────────────────────

-- Create the product images storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,         -- public reads (catalog images)
  5242880,      -- 5 MB per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- ── Storage RLS policies ─────────────────────────────────────────────────────

-- Public can read any file in the bucket
create policy "public_read_product_images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Only admins can upload files
create policy "admins_upload_product_images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and public.is_admin()
  );

-- Only admins can update/replace files
create policy "admins_update_product_images"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and public.is_admin()
  );

-- Only admins can delete files
create policy "admins_delete_product_images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and public.is_admin()
  );
