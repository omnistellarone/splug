import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getAdminOrdersAction } from "@/lib/admin/actions";
import { formatMoney } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Orders Management — Slurge Admin",
  description: "View and fulfill customer electronics orders.",
};

interface OrdersPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const { status } = await searchParams;
  const orders = await getAdminOrdersAction(status);

  const statusFilters = [
    { label: "All Orders", value: "all" },
    { label: "Paid", value: "paid" },
    { label: "Processing", value: "processing" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Customer Orders
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Monitor incoming purchases, track shipments, and update fulfillment states
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {statusFilters.map((tab) => {
          const isActive = (!status && tab.value === "all") || status === tab.value;
          return (
            <Link
              key={tab.value}
              href={tab.value === "all" ? "/admin/orders" : `/admin/orders?status=${tab.value}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] border border-[var(--border)]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Orders Table Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--text-primary)]">
            <thead className="bg-[var(--surface-muted)] text-[var(--text-muted)] font-semibold border-b border-[var(--border)]">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Fulfillment</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[var(--text-muted)]">
                    No orders matching the selected filter.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-[var(--surface-muted)]/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-[var(--text-primary)]">
                        #{o.id.slice(0, 8)}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)]">
                        {new Date(o.createdAt).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold">
                      {o.shippingName}
                    </td>

                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                      {o.shippingCity}, {o.shippingState}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className="text-[10px]">
                        {o.itemsCount} {o.itemsCount === 1 ? "item" : "items"}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">
                      {formatMoney(o.totalMinor)}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          o.paymentStatus === "paid" ? "default" : "secondary"
                        }
                        className="text-[10px] uppercase font-bold"
                      >
                        {o.paymentStatus}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          o.status === "delivered"
                            ? "default"
                            : o.status === "cancelled"
                            ? "destructive"
                            : "outline"
                        }
                        className="text-[10px] uppercase font-bold"
                      >
                        {o.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2.5 text-xs font-semibold gap-1"
                        asChild
                      >
                        <Link href={`/admin/orders/${o.id}`}>
                          <span>Manage</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
