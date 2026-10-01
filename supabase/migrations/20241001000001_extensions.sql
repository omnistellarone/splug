-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 001: Extensions & helpers
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable pgcrypto for gen_random_uuid() (available by default in Supabase)
create extension if not exists "pgcrypto";

-- Helper: auto-update updated_at timestamps
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

-- Helper: create updated_at trigger on any table
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
