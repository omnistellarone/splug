-- =============================================================================
-- SEED PRODUCTS & PRODUCT VARIANTS
-- Run in Supabase SQL Editor to populate live database products
-- =============================================================================

do $$
declare
  v_cat_phones uuid;
  v_cat_laptops uuid;
  v_cat_audio uuid;
  v_cat_gaming uuid;
  v_cat_wearables uuid;
  v_cat_accessories uuid;

  v_brand_apple uuid;
  v_brand_samsung uuid;
  v_brand_sony uuid;
  v_brand_dell uuid;
  v_brand_anker uuid;

  v_prod_id uuid;
begin
  select id into v_cat_phones from public.categories where slug = 'phones' limit 1;
  select id into v_cat_laptops from public.categories where slug = 'laptops' limit 1;
  select id into v_cat_audio from public.categories where slug = 'audio' limit 1;
  select id into v_cat_gaming from public.categories where slug = 'gaming' limit 1;
  select id into v_cat_wearables from public.categories where slug = 'wearables' limit 1;
  select id into v_cat_accessories from public.categories where slug = 'accessories' limit 1;

  select id into v_brand_apple from public.brands where slug = 'apple' limit 1;
  select id into v_brand_samsung from public.brands where slug = 'samsung' limit 1;
  select id into v_brand_sony from public.brands where slug = 'sony' limit 1;
  select id into v_brand_dell from public.brands where slug = 'dell' limit 1;
  select id into v_brand_anker from public.brands where slug = 'anker' limit 1;

  -- 1. iPhone 16 Pro Max
  insert into public.products (name, slug, description, category_id, brand_id, is_active, meta_title)
  values (
    'Apple iPhone 16 Pro Max',
    'apple-iphone-16-pro-max',
    'Engineered with grade 5 titanium and the powerhouse A18 Pro chip. Features Camera Control, 48MP Fusion camera with 5x optical telephoto, and industry-leading battery life.',
    v_cat_phones,
    v_brand_apple,
    true,
    'Buy iPhone 16 Pro Max in Nigeria — Splug'
  )
  on conflict (slug) do update set name = excluded.name
  returning id into v_prod_id;

  insert into public.product_variants (product_id, sku, price_minor, compare_at_minor, options, stock)
  values
    (v_prod_id, 'IP16PM-256-NAT', 235000000, 250000000, '{"color": "Natural Titanium", "storage": "256GB"}'::jsonb, 12),
    (v_prod_id, 'IP16PM-512-BLK', 265000000, 280000000, '{"color": "Black Titanium", "storage": "512GB"}'::jsonb, 7),
    (v_prod_id, 'IP16PM-1TB-DES', 295000000, null, '{"color": "Desert Titanium", "storage": "1TB"}'::jsonb, 4)
  on conflict (sku) do nothing;

  insert into public.product_images (product_id, storage_path, alt_text, is_primary)
  values (
    v_prod_id,
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
    'iPhone 16 Pro Max Titanium',
    true
  ) on conflict do nothing;

  -- 2. Galaxy S25 Ultra
  insert into public.products (name, slug, description, category_id, brand_id, is_active, meta_title)
  values (
    'Samsung Galaxy S25 Ultra 5G',
    'samsung-galaxy-s25-ultra-5g',
    'Galaxy AI supercharged with Snapdragon 8 Elite. Refined titanium frame, 200MP Quad Tele system, built-in S Pen, and Dynamic AMOLED 2X display.',
    v_cat_phones,
    v_brand_samsung,
    true,
    'Samsung Galaxy S25 Ultra 5G Nigeria — Splug'
  )
  on conflict (slug) do update set name = excluded.name
  returning id into v_prod_id;

  insert into public.product_variants (product_id, sku, price_minor, compare_at_minor, options, stock)
  values
    (v_prod_id, 'S25U-256-GRY', 210000000, 230000000, '{"color": "Titanium Gray", "storage": "256GB"}'::jsonb, 15),
    (v_prod_id, 'S25U-512-BLK', 240000000, 260000000, '{"color": "Titanium Black", "storage": "512GB"}'::jsonb, 9)
  on conflict (sku) do nothing;

  insert into public.product_images (product_id, storage_path, alt_text, is_primary)
  values (
    v_prod_id,
    'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
    'Samsung Galaxy S25 Ultra',
    true
  ) on conflict do nothing;

  -- 3. MacBook Pro 16 M4 Max
  insert into public.products (name, slug, description, category_id, brand_id, is_active, meta_title)
  values (
    'Apple MacBook Pro 16″ (M4 Max)',
    'apple-macbook-pro-16-m4-max',
    'Unrivaled pro performance with the M4 Max chip (16-core CPU, 40-core GPU). Liquid Retina XDR display with up to 1600 nits peak brightness, Thunderbolt 5, and 24h battery.',
    v_cat_laptops,
    v_brand_apple,
    true,
    'MacBook Pro 16 M4 Max in Nigeria — Splug'
  )
  on conflict (slug) do update set name = excluded.name
  returning id into v_prod_id;

  insert into public.product_variants (product_id, sku, price_minor, compare_at_minor, options, stock)
  values
    (v_prod_id, 'MBP16-M4M-36G-1T', 480000000, 510000000, '{"color": "Space Black", "storage": "1TB SSD", "ram": "36GB"}'::jsonb, 5),
    (v_prod_id, 'MBP16-M4M-48G-2T', 560000000, null, '{"color": "Space Black", "storage": "2TB SSD", "ram": "48GB"}'::jsonb, 3)
  on conflict (sku) do nothing;

  insert into public.product_images (product_id, storage_path, alt_text, is_primary)
  values (
    v_prod_id,
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    'MacBook Pro 16 Space Black',
    true
  ) on conflict do nothing;

  -- 4. Sony WH-1000XM5
  insert into public.products (name, slug, description, category_id, brand_id, is_active, meta_title)
  values (
    'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    'sony-wh-1000xm5-wireless-headphones',
    'Industry-leading noise cancellation powered by two processors and 8 microphones. 30-hour battery life and exceptional hands-free calling.',
    v_cat_audio,
    v_brand_sony,
    true,
    'Sony WH-1000XM5 Headphones Nigeria — Splug'
  )
  on conflict (slug) do update set name = excluded.name
  returning id into v_prod_id;

  insert into public.product_variants (product_id, sku, price_minor, compare_at_minor, options, stock)
  values
    (v_prod_id, 'SONY-XM5-BLK', 48000000, 52000000, '{"color": "Black"}'::jsonb, 18),
    (v_prod_id, 'SONY-XM5-SLV', 48000000, 52000000, '{"color": "Silver"}'::jsonb, 10)
  on conflict (sku) do nothing;

  insert into public.product_images (product_id, storage_path, alt_text, is_primary)
  values (
    v_prod_id,
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    'Sony WH-1000XM5',
    true
  ) on conflict do nothing;

  -- 5. PlayStation 5 Pro
  insert into public.products (name, slug, description, category_id, brand_id, is_active, meta_title)
  values (
    'Sony PlayStation 5 Pro Console (2TB)',
    'sony-playstation-5-pro-2tb',
    'PlayStation Spectral Super Resolution (PSSR), advanced ray tracing, and 60FPS fidelity mode. Built with 2TB ultra-high-speed SSD.',
    v_cat_gaming,
    v_brand_sony,
    true,
    'PlayStation 5 Pro Nigeria — Splug'
  )
  on conflict (slug) do update set name = excluded.name
  returning id into v_prod_id;

  insert into public.product_variants (product_id, sku, price_minor, compare_at_minor, options, stock)
  values
    (v_prod_id, 'PS5-PRO-2TB', 125000000, 135000000, '{"storage": "2TB SSD"}'::jsonb, 8)
  on conflict (sku) do nothing;

  insert into public.product_images (product_id, storage_path, alt_text, is_primary)
  values (
    v_prod_id,
    'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
    'PlayStation 5 Pro',
    true
  ) on conflict do nothing;

  -- 6. Anker Prime 200W Power Bank
  insert into public.products (name, slug, description, category_id, brand_id, is_active, meta_title)
  values (
    'Anker Prime 20,000mAh Power Bank (200W)',
    'anker-prime-20000mah-power-bank-200w',
    '200W total output with smart digital display showing wattage and battery stats in real time. Fast recharge in 1h 15m.',
    v_cat_accessories,
    v_brand_anker,
    true,
    'Anker Prime 200W Power Bank Nigeria — Splug'
  )
  on conflict (slug) do update set name = excluded.name
  returning id into v_prod_id;

  insert into public.product_variants (product_id, sku, price_minor, compare_at_minor, options, stock)
  values
    (v_prod_id, 'ANK-PRIME-20K-200W', 19500000, 22000000, '{"color": "Space Gray", "capacity": "20,000mAh"}'::jsonb, 35)
  on conflict (sku) do nothing;

  insert into public.product_images (product_id, storage_path, alt_text, is_primary)
  values (
    v_prod_id,
    'https://images.unsplash.com/photo-1609592426508-cc02081d4a03?auto=format&fit=crop&w=800&q=80',
    'Anker Prime Power Bank',
    true
  ) on conflict do nothing;
end;
$$;
