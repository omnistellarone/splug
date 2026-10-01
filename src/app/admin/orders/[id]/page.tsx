import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  MapPin,
  CreditCard,
  Send,
  Calendar,
} from "lucide-react";
import { requireAdminSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateOrderStatusAction } from "@/lib/admin/actions";
import { formatMoney } from "@/lib/money";
import type { Order, OrderItem, OrderStatus } from "@/lib/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Order Fulfillment — Splug Admin",
  description: "Inspect customer order details and update shipping status.",
};

interface AdminOrderDetailRecord extends Order {
  order_items: OrderItem[];
}

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  await requireAdminSession();
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: rawOrder, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .eq("id", id)
    .single();

  if (error || !rawOrder) {
    notFound();
  }

  const order = rawOrder as unknown as AdminOrderDetailRecord;

  async function handleStatusUpdate(formData: FormData) {
    "use server";
    const nextStatus = formData.get("status") as OrderStatus;
    if (nextStatus) {
      await updateOrderStatusAction(id, nextStatus);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in-0 duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mb-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Orders</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] font-mono">
              Order #{order.id.slice(0, 8)}
            </h1>
            <Badge
              variant={order.payment_status === "paid" ? "default" : "secondary"}
              className="text-xs font-bold uppercase"
            >
              {order.payment_status}
            </Badge>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              Placed on{" "}
              {new Date(order.created_at).toLocaleDateString("en-NG", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </p>
        </div>

        {/* Status Transition Control Card */}
        <div className="rounded-2xl border border-[var(--primary)]/30 bg-[var(--surface)] p-4 shadow-sm">
          <form action={handleStatusUpdate} className="flex items-center gap-3">
            <div>
              <label
                htmlFor="status"
                className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1"
              >
                Fulfillment Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={order.status}
                className="h-9 px-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <Button
              type="submit"
              size="sm"
              className="mt-4 font-semibold text-xs gap-1.5 shadow-sm"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Update & Notify</span>
            </Button>
          </form>
        </div>
      </div>

      {/* Grid: Order Items & Delivery Address */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Ordered Items (Span 2) */}
        <div className="md:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Purchased Hardware ({order.order_items?.length || 0})
          </h2>

          <div className="divide-y divide-[var(--border)]/50">
            {order.order_items?.map((item: {
              id: string;
              product_name: string;
              variant_sku: string;
              unit_price_minor: number;
              quantity: number;
              line_total_minor: number;
            }) => (
              <div
                key={item.id}
                className="py-3.5 flex items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-[var(--text-primary)]">
                    {item.product_name}
                  </div>
                  <div className="text-[11px] font-mono text-[var(--text-muted)]">
                    SKU: {item.variant_sku}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    {formatMoney(item.unit_price_minor)} × {item.quantity}
                  </div>
                </div>

                <div className="font-bold text-sm text-[var(--text-primary)]">
                  {formatMoney(item.line_total_minor)}
                </div>
              </div>
            ))}
          </div>

          {/* Totals Breakdown */}
          <div className="pt-4 border-t border-[var(--border)] space-y-2 text-xs">
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Subtotal</span>
              <span>{formatMoney(order.subtotal_minor)}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Delivery Fee</span>
              <span>
                {order.shipping_minor === 0
                  ? "FREE"
                  : formatMoney(order.shipping_minor)}
              </span>
            </div>
            {order.discount_minor > 0 && (
              <div className="flex justify-between text-emerald-500 font-semibold">
                <span>Discount ({order.coupon_code || "Promo"})</span>
                <span>-{formatMoney(order.discount_minor)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-[var(--text-primary)] pt-2 border-t border-[var(--border)]">
              <span>Total Paid</span>
              <span>{formatMoney(order.total_minor)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Delivery Info */}
        <div className="space-y-6">
          {/* Shipping Destination */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <MapPin className="h-4 w-4" />
              <span>Shipping Address</span>
            </div>
            <div className="text-xs space-y-1 text-[var(--text-secondary)]">
              <div className="font-bold text-[var(--text-primary)] text-sm">
                {order.shipping_name}
              </div>
              <div>{order.shipping_address1}</div>
              {order.shipping_address2 && <div>{order.shipping_address2}</div>}
              <div>
                {order.shipping_city}, {order.shipping_state}
              </div>
              <div>Nigeria ({order.shipping_country})</div>
              <div className="pt-2 font-mono text-[var(--text-primary)]">
                Tel: {order.shipping_phone}
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <CreditCard className="h-4 w-4" />
              <span>Payment Details</span>
            </div>
            <div className="text-xs space-y-1.5 text-[var(--text-secondary)]">
              <div className="flex justify-between">
                <span>Provider:</span>
                <span className="font-bold text-[var(--text-primary)]">Paystack</span>
              </div>
              <div className="flex justify-between">
                <span>Reference:</span>
                <span className="font-mono text-[11px] text-[var(--text-primary)]">
                  {order.payment_reference || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="capitalize font-bold text-emerald-500">
                  {order.payment_status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
