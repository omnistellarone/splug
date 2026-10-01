-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 011: Seed data — categories and a sample admin account
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Seed categories ───────────────────────────────────────────────────────────
insert into public.categories (name, slug, description, sort_order) values
  ('Phones',      'phones',      'Smartphones and mobile devices',            1),
  ('Laptops',     'laptops',     'Laptops, notebooks, and ultrabooks',         2),
  ('Audio',       'audio',       'Headphones, speakers, and earbuds',          3),
  ('Gaming',      'gaming',      'Gaming consoles, accessories, and gear',     4),
  ('Smart Home',  'smart-home',  'Smart home devices and accessories',         5),
  ('Accessories', 'accessories', 'Cables, chargers, cases, and more',          6),
  ('Tablets',     'tablets',     'Tablets and e-readers',                      7),
  ('Cameras',     'cameras',     'Cameras, lenses, and photography gear',      8),
  ('Wearables',   'wearables',  'Smartwatches, fitness trackers, and bands',  9),
  ('Networking',  'networking',  'Routers, switches, and network accessories', 10)
on conflict (slug) do nothing;

-- ── Seed brands ───────────────────────────────────────────────────────────────
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

-- Note: Admin account is created manually via Supabase Dashboard or auth API,
-- then assigned the 'admin' role via service-role:
--   insert into public.user_roles (user_id, role) values ('<your-user-uuid>', 'admin');
-- This is intentionally NOT seeded here to avoid hardcoding credentials.
