import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Package,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Truck,
  Sparkles,
} from "lucide-react";
import { getCurrentUserSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "My Orders — Slurge Electronics",
  description: "View and track your electronics purchases and delivery statuses.",
};

interface DbOrderSummary {
  id: string;
  status: string;
  payment_status: string;
  total_minor: number;
  payment_reference: string | null;
  created_at: string;
  shipping_city: string;
  shipping_state: string;
  order_items: Array<{
    product_name: string;
    quantity: number;
    line_total_minor: number;
  }>;
}

export default async function OrdersHistoryPage() {
  const session = await getCurrentUserSession();

  if (!session.user) {
    redirect("/sign-in?redirectTo=/account/orders");
  }

  const supabase = await createClient();
  const { data: rawOrders, error } = await supabase
    .from("orders")
    .select(`
      id,
      status,
      payment_status,
      total_minor,
      payment_reference,
      created_at,
      shipping_city,
      shipping_state,
      order_items (
        product_name,
        quantity,
        line_total_minor
      )
    `)
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading user orders:", error);
  }

  const orders = (rawOrders as unknown as DbOrderSummary[]) || [];

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (status === "delivered") {
      return (
        <Badge variant="success" className="font-semibold">
          Delivered
        </Badge>
      );
    }
    if (status === "shipped") {
      return (
        <Badge variant="default" className="font-semibold bg-cyan-600 hover:bg-cyan-600">
          Dispatched
        </Badge>
      );
    }
    if (status === "paid" || paymentStatus === "paid") {
      return (
        <Badge variant="success" className="font-semibold">
          Paid & Processing
        </Badge>
      );
    }
    if (status === "cancelled") {
      return (
        <Badge variant="destructive" className="font-semibold">
          Cancelled
        </Badge>
      );
    }
    return (
      <Badge variant="warning" className="font-semibold">
        Pending Payment
      </Badge>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mb-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Account</span>
        </Link>
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Order History
          </h1>
          <span className="text-xs text-[var(--text-muted)] font-medium">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
          Review recent electronics purchases, check delivery progress, and view invoices
        </p>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-[var(--surface-subtle)] text-[var(--text-muted)] flex items-center justify-center">
            <Package className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="font-bold text-base text-[var(--text-primary)]">
              No orders found
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
              You haven’t completed any purchases with this account yet.
            </p>
          </div>
          <Button asChild className="font-semibold gap-2">
            <Link href="/shop">
              <Sparkles className="h-4 w-4" />
              <span>Explore Products</span>
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
            const dateStr = new Date(ord.created_at).toLocaleDateString("en-NG", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

            const totalItemsCount = ord.order_items.reduce(
              (acc, item) => acc + item.quantity,
              0
            );

            return (
              <div
                key={ord.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 hover:border-[var(--primary)]/30 hover:shadow-md transition-all space-y-4"
              >
                {/* Top Row: Ref, Date & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                        {ord.payment_reference || ord.id.substring(0, 13)}
                      </span>
                      {getStatusBadge(ord.status, ord.payment_status)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{dateStr}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        <span>
                          {ord.shipping_city}, {ord.shipping_state}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-base sm:text-lg font-bold text-[var(--text-primary)] block">
                      {formatMoney(ord.total_minor)}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
                    </span>
                  </div>
                </div>

                {/* Items Summary Preview */}
                <div className="space-y-1.5 text-xs">
                  {ord.order_items.slice(0, 3).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-[var(--text-secondary)]"
                    >
                      <span className="truncate pr-4">
                        {item.quantity}× {item.product_name}
                      </span>
                      <span className="font-semibold text-[var(--text-primary)] shrink-0">
                        {formatMoney(item.line_total_minor)}
                      </span>
                    </div>
                  ))}
                  {ord.order_items.length > 3 && (
                    <p className="text-[11px] text-[var(--text-muted)]">
                      +{ord.order_items.length - 3} more items
                    </p>
                  )}
                </div>

                {/* View Details Action */}
                <div className="pt-2 flex justify-end">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="text-xs font-semibold gap-1 hover:text-[var(--primary)]"
                  >
                    <Link href={`/account/orders/${ord.id}`}>
                      <span>View Order Details</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
