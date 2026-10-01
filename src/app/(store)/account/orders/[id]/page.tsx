import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ChevronLeft,
  Calendar,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Package,
} from "lucide-react";
import { getCurrentUserSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Order Details #${id.substring(0, 8).toUpperCase()} — Splug`,
  };
}

interface FullOrderDetails {
  id: string;
  user_id: string;
  status: string;
  payment_status: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address1: string;
  shipping_address2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
  subtotal_minor: number;
  shipping_minor: number;
  discount_minor: number;
  total_minor: number;
  coupon_code: string | null;
  payment_reference: string | null;
  customer_note: string | null;
  created_at: string;
  order_items: Array<{
    id: string;
    product_name: string;
    variant_sku: string;
    variant_options: Record<string, string>;
    unit_price_minor: number;
    quantity: number;
    line_total_minor: number;
    image_url: string | null;
  }>;
  order_status_history: Array<{
    id: string;
    from_status: string | null;
    to_status: string;
    note: string | null;
    created_at: string;
  }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const session = await getCurrentUserSession();

  if (!session.user) {
    redirect(`/sign-in?redirectTo=/account/orders/${id}`);
  }

  const supabase = await createClient();
  const { data: rawOrder, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*),
      order_status_history (*)
    `)
    .eq("id", id)
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error || !rawOrder) {
    notFound();
  }

  const order = rawOrder as unknown as FullOrderDetails;

  const dateFormatted = new Date(order.created_at).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Tracking steps
  const steps = [
    { key: "pending", label: "Order Placed" },
    { key: "paid", label: "Payment Confirmed" },
    { key: "shipped", label: "Dispatched" },
    { key: "delivered", label: "Delivered" },
  ];

  const getStepStatus = (stepKey: string) => {
    if (order.status === "cancelled") return "cancelled";
    if (order.status === "delivered") return "completed";
    if (order.status === "shipped") {
      return stepKey === "delivered" ? "upcoming" : "completed";
    }
    if (order.status === "paid" || order.payment_status === "paid") {
      if (stepKey === "pending" || stepKey === "paid") return "completed";
      return "upcoming";
    }
    return stepKey === "pending" ? "completed" : "upcoming";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Navigation */}
      <div>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mb-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Order History</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Order Details
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
              Reference: {order.payment_reference || order.id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{dateFormatted}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Order Status Tracker ── */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
        <h2 className="text-sm font-bold text-[var(--text-primary)]">
          Fulfillment Timeline
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {steps.map((st) => {
            const statusType = getStepStatus(st.key);
            const isCompleted = statusType === "completed";

            return (
              <div key={st.key} className="flex flex-col items-center text-center space-y-2">
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center border transition-all",
                    isCompleted
                      ? "border-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]"
                      : "border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-muted)]"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    isCompleted
                      ? "text-[var(--text-primary)]"
                      : "text-[var(--text-muted)]"
                  )}
                >
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Line Items Snapshot Table ── */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-sm divide-y divide-[var(--border)]">
        <div className="p-4 sm:p-6 bg-[var(--surface-subtle)] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Package className="h-4 w-4 text-[var(--primary)]" />
            <span>Purchased Items ({order.order_items.length})</span>
          </h2>
          <Badge variant="secondary" className="font-semibold text-xs">
            {order.status.toUpperCase()}
          </Badge>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {order.order_items.map((item) => {
            const variantOptionsText =
              Object.values(item.variant_options || {}).filter(Boolean).join(" • ") ||
              item.variant_sku;

            return (
              <div
                key={item.id}
                className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-[var(--text-muted)]" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-sm text-[var(--text-primary)]">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {variantOptionsText}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Qty: {item.quantity} × {formatMoney(item.unit_price_minor)}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-sm sm:text-base font-extrabold text-[var(--text-primary)]">
                    {formatMoney(item.line_total_minor)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Financial Summary & Shipping Snapshot Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
        {/* Shipping Address Snapshot */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-[var(--primary)]" />
            <span>Delivery Destination</span>
          </h3>
          <div className="text-xs text-[var(--text-secondary)] space-y-1">
            <p className="font-bold text-sm text-[var(--text-primary)]">
              {order.shipping_name}
            </p>
            <p>{order.shipping_phone}</p>
            <p>{order.shipping_address1}</p>
            {order.shipping_address2 && <p>{order.shipping_address2}</p>}
            <p>
              {order.shipping_city}, {order.shipping_state}, {order.shipping_country}
            </p>
          </div>
          {order.customer_note && (
            <div className="pt-2 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
              <strong>Note:</strong> {order.customer_note}
            </div>
          )}
        </div>

        {/* Totals Breakdown */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Payment Summary
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Items Subtotal</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {formatMoney(order.subtotal_minor)}
              </span>
            </div>
            {order.discount_minor > 0 && (
              <div className="flex justify-between text-[var(--success)]">
                <span>Discount ({order.coupon_code || "PROMO"})</span>
                <span className="font-bold">-{formatMoney(order.discount_minor)}</span>
              </div>
            )}
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Express Delivery Fee</span>
              <span>
                {order.shipping_minor === 0 ? "FREE" : formatMoney(order.shipping_minor)}
              </span>
            </div>
            <div className="pt-2 border-t border-[var(--border)] flex justify-between text-base">
              <span className="font-bold text-[var(--text-primary)]">Total Paid</span>
              <span className="text-lg font-extrabold text-[var(--text-primary)]">
                {formatMoney(order.total_minor)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 text-[11px] text-[var(--success)]">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Insured & covered by 1-Year Official Manufacturer Warranty</span>
          </div>
        </div>
      </div>
    </div>
  );
}
