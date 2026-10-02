import * as React from "react";
import type { Metadata } from "next";

import { getAdminCustomersAction } from "@/lib/admin/actions";
import { formatMoney } from "@/lib/money";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Customers Directory — Slurge Admin",
  description: "View registered customer accounts, order history, and lifetime spend.",
};

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomersAction();

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-300">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Registered Customers
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
          Directory of buyer profiles, order volume, and lifetime platform value
        </p>
      </div>

      {/* Customers Table Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--text-primary)]">
            <thead className="bg-[var(--surface-muted)] text-[var(--text-muted)] font-semibold border-b border-[var(--border)]">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Paid Orders</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4 text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/50">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[var(--text-muted)]">
                    No customer accounts registered yet.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-[var(--surface-muted)]/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {c.displayName.charAt(0).toUpperCase()}
                        </div>
                        <span>{c.displayName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[var(--text-secondary)]">
                      {c.phone || "—"}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className="text-[10px]">
                        {c.orderCount} {c.orderCount === 1 ? "order" : "orders"}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">
                      {formatMoney(c.totalSpentMinor)}
                    </td>

                    <td className="py-3.5 px-4 text-right text-[var(--text-muted)]">
                      {new Date(c.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
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
