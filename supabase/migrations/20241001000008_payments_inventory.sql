-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 008: Payments & Inventory
-- AGENTS.md §14 — stock update must be atomic & idempotent
-- AGENTS.md §16 — server must verify Paystack, never trust client
-- ─────────────────────────────────────────────────────────────────────────────

-- ── payment_records ───────────────────────────────────────────────────────────
-- Full audit trail of payment events from Paystack webhooks
create table public.payment_records (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references public.orders(id) on delete restrict,
  paystack_reference  text not null unique,
  paystack_event_type text,                         -- e.g. 'charge.success'
  -- Amount Paystack reported (kobo) — must match order total_minor
  amount_minor        int not null check (amount_minor >= 0),
  currency            text not null default 'NGN',
  status              public.payment_status not null default 'pending',
  -- Full Paystack event payload for audit/debugging
  raw_payload         jsonb,
  -- Idempotency: track which webhook events have been processed
  processed_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_payment_records_order_id on public.payment_records(order_id);
create index idx_payment_records_reference on public.payment_records(paystack_reference);

create trigger trg_payment_records_updated_at
  before update on public.payment_records
  for each row execute function public.handle_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.payment_records enable row level security;

-- Users can read their own payment records
create policy "users_read_own_payment_records"
  on public.payment_records for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

-- Only service-role (webhook handler) can insert/update payment records.
-- No user-facing INSERT/UPDATE policies — AGENTS.md §16.

create policy "admins_read_all_payment_records"
  on public.payment_records for select
  using (public.is_admin());


-- ── inventory_movements ───────────────────────────────────────────────────────
-- Audit trail for stock changes. AGENTS.md §14.
create table public.inventory_movements (
  id              uuid primary key default gen_random_uuid(),
  variant_id      uuid not null references public.product_variants(id) on delete cascade,
  order_id        uuid references public.orders(id) on delete set null,
  -- Positive = stock in, negative = stock out
  delta           int not null,
  reason          text not null check (
    reason in ('purchase', 'restock', 'adjustment', 'return', 'damaged')
  ),
  note            text,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index idx_inventory_movements_variant_id on public.inventory_movements(variant_id);
create index idx_inventory_movements_order_id on public.inventory_movements(order_id) where order_id is not null;

alter table public.inventory_movements enable row level security;

-- Only admins can read inventory movements
create policy "admins_all_inventory_movements"
  on public.inventory_movements for all
  using (public.is_admin())
  with check (public.is_admin());


-- ─────────────────────────────────────────────────────────────────────────────
-- Atomic payment finalization function
-- Called by the webhook handler (service-role) after verifying Paystack signature.
-- Idempotent — safe to call multiple times for the same reference. AGENTS.md §14 §16.
-- ─────────────────────────────────────────────────────────────────────────────
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
  -- Lock the order row to prevent concurrent processing
  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'order_not_found');
  end if;

  -- Idempotency check: has this reference already been fully processed?
  select exists(
    select 1 from public.payment_records
    where paystack_reference = p_paystack_reference
      and status = 'paid'
      and processed_at is not null
  ) into v_already_processed;

  if v_already_processed then
    return jsonb_build_object('ok', true, 'idempotent', true);
  end if;

  -- Amount verification: reject if Paystack amount does not match order total
  if p_amount_minor <> v_order.total_minor then
    return jsonb_build_object(
      'ok', false,
      'error', 'amount_mismatch',
      'expected', v_order.total_minor,
      'received', p_amount_minor
    );
  end if;

  -- Insert or update payment record
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

  -- Update order status + payment status
  update public.orders set
    status          = 'paid',
    payment_status  = 'paid',
    payment_reference = p_paystack_reference,
    updated_at      = now()
  where id = p_order_id;

  -- Record status history
  insert into public.order_status_history (order_id, from_status, to_status, note)
  values (p_order_id, v_order.status, 'paid', 'Payment verified via Paystack webhook');

  -- Decrement stock for each order item (atomic, inside transaction)
  for v_item in
    select * from public.order_items where order_id = p_order_id
  loop
    if v_item.variant_id is not null then
      update public.product_variants
      set stock = stock - v_item.quantity,
          updated_at = now()
      where id = v_item.variant_id;

      -- Log inventory movement
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

comment on function public.finalize_payment is
  'Atomic, idempotent payment finalization. Verifies amount, updates order, decrements stock, logs movements. Call only from service-role after Paystack signature verification.';
