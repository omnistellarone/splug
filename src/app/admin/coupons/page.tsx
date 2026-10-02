import * as React from "react";
import type { Metadata } from "next";
import { Ticket } from "@/components/ui/icons";
import {
  getAdminCouponsAction,
  createCouponAction,
  toggleCouponActiveAction,
} from "@/lib/admin/actions";
import { formatMoney } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Promotional Coupons — Slurge Admin",
  description: "Create and manage promotional discount coupons.",
};

export default async function AdminCouponsPage() {
  const coupons = await getAdminCouponsAction();

  async function handleCreateCoupon(formData: FormData) {
    "use server";
    await createCouponAction(formData);
  }

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-300">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Discount Coupons
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
          Create promotional discount codes and manage coupon eligibility
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Coupon Card (1 col) */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-[var(--primary)]" />
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Create New Coupon
            </h2>
          </div>

          <form action={handleCreateCoupon} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="code" className="font-semibold text-[var(--text-secondary)]">
                Coupon Code *
              </Label>
              <Input
                id="code"
                name="code"
                required
                placeholder="e.g. SLURGE2026"
                className="uppercase font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="font-semibold text-[var(--text-secondary)]">
                Description
              </Label>
              <Input
                id="description"
                name="description"
                placeholder="e.g. 10% off independence sale"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="discountType" className="font-semibold text-[var(--text-secondary)]">
                  Type *
                </Label>
                <select
                  id="discountType"
                  name="discountType"
                  className="w-full h-9 px-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-primary)]"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed_minor">Fixed (₦)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="discountValue" className="font-semibold text-[var(--text-secondary)]">
                  Value *
                </Label>
                <Input
                  id="discountValue"
                  name="discountValue"
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 10 or 5000"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="minOrderNaira" className="font-semibold text-[var(--text-secondary)]">
                Min Order Spend (₦)
              </Label>
              <Input
                id="minOrderNaira"
                name="minOrderNaira"
                type="number"
                placeholder="e.g. 50000"
                defaultValue="0"
              />
            </div>

            <Button type="submit" className="w-full font-semibold shadow-sm">
              Save Coupon
            </Button>
          </form>
        </div>

        {/* Coupons List Table (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Active Coupons ({coupons.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--text-primary)]">
              <thead className="bg-[var(--surface-muted)] text-[var(--text-muted)] font-semibold border-b border-[var(--border)]">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Min Spend</th>
                  <th className="py-3 px-4">Used</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/50">
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[var(--text-muted)]">
                      No discount coupons created yet.
                    </td>
                  </tr>
                ) : (
                  coupons.map((c) => {
                    async function handleToggle() {
                      "use server";
                      await toggleCouponActiveAction(c.id, !c.isActive);
                    }

                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-[var(--surface-muted)]/30 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-[var(--primary)]">
                          {c.code}
                        </td>

                        <td className="py-3.5 px-4 font-semibold">
                          {c.discountType === "percentage"
                            ? `${c.discountValue}%`
                            : formatMoney(c.discountValue)}
                        </td>

                        <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                          {c.minOrderMinor === 0
                            ? "None"
                            : formatMoney(c.minOrderMinor)}
                        </td>

                        <td className="py-3.5 px-4 text-[var(--text-muted)] font-mono">
                          {c.usedCount}
                          {c.maxUses ? ` / ${c.maxUses}` : ""}
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge
                            variant={c.isActive ? "default" : "secondary"}
                            className="text-[10px] uppercase font-bold"
                          >
                            {c.isActive ? "Active" : "Disabled"}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <form action={handleToggle}>
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-[11px] text-[var(--text-secondary)]"
                            >
                              {c.isActive ? "Disable" : "Enable"}
                            </Button>
                          </form>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
