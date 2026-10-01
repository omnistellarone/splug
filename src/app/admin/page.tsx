import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowRight,
  Package,
  Plus,
  Ticket,
  ChevronRight,
} from "lucide-react";
import { getAdminAnalyticsAction } from "@/lib/admin/actions";
import { formatMoney } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Dashboard Overview — Splug Admin",
  description: "High-level metrics, revenue, and inventory status for Splug Electronics.",
};

export default async function AdminDashboardPage() {
  const summary = await getAdminAnalyticsAction();

  const metrics = [
    {
      title: "Total Revenue",
      value: formatMoney(summary.totalRevenueMinor),
      subtext: "From verified Paystack payments",
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Paid Orders",
      value: summary.totalPaidOrders.toString(),
      subtext: "Successful customer checkouts",
      icon: ShoppingBag,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Registered Customers",
      value: summary.totalCustomers.toString(),
      subtext: "Total buyer accounts created",
      icon: Users,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      title: "Average Order Value",
      value: formatMoney(summary.averageOrderValueMinor),
      subtext: "Revenue per paid order",
      icon: Package,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-300">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Operations Overview
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Real-time financial performance and inventory health
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" className="font-semibold gap-1.5 shadow-sm" asChild>
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="font-semibold gap-1.5"
            asChild
          >
            <Link href="/admin/coupons">
              <Ticket className="h-4 w-4" />
              <span>New Coupon</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.title}
              className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-muted)]">
                  {m.title}
                </span>
                <div className={`p-2 rounded-xl ${m.bg}`}>
                  <Icon className={`h-4 w-4 ${m.color}`} />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
                  {m.value}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  {m.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Low Stock Warning Banner if applicable */}
      {summary.lowStockCount > 0 && (
        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                Low Stock Alert ({summary.lowStockCount} items below threshold)
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Certain electronic product variants have 5 or fewer units remaining in inventory.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-semibold shrink-0"
            asChild
          >
            <Link href="/admin/products">Manage Inventory</Link>
          </Button>
        </div>
      )}

      {/* Dual Columns: Recent Orders & Low Stock Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-[var(--primary)] hover:underline inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {summary.recentOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              No orders placed yet.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]/50">
              {summary.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-[var(--text-primary)]">
                      {order.customerName}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      {new Date(order.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="font-bold text-[var(--text-primary)]">
                      {formatMoney(order.totalMinor)}
                    </div>
                    <Badge
                      variant={
                        order.paymentStatus === "paid" ? "default" : "secondary"
                      }
                      className="text-[10px] uppercase font-bold"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Watchlist */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Inventory Watchlist
            </h2>
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-[var(--primary)] hover:underline inline-flex items-center gap-1"
            >
              <span>All Products</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {summary.lowStockVariants.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              All inventory levels are healthy (greater than 5 units).
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]/50">
              {summary.lowStockVariants.map((item) => (
                <div
                  key={item.variantId}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-[var(--text-primary)]">
                      {item.productName}
                    </div>
                    <div className="text-[11px] font-mono text-[var(--text-muted)]">
                      SKU: {item.sku}
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                        item.stock === 0
                          ? "bg-red-500/10 text-red-500"
                          : "bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      {item.stock} left
                    </span>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      {formatMoney(item.priceMinor)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
