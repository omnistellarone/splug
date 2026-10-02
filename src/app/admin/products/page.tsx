import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Package,
  Plus,
  ExternalLink,
  Pencil,
  Trash2,
} from "@/components/ui/icons";
import {
  getAdminProductsAction,
  toggleProductActiveAction,
  deleteProductAction,
} from "@/lib/admin/actions";
import { formatMoney } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Products & Inventory — Slurge Admin",
  description: "Manage electronics catalog products and stock levels.",
};

export default async function AdminProductsPage() {
  const products = await getAdminProductsAction();

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Products & Variants
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Manage your hardware catalog, SKUs, pricing, and live inventory
          </p>
        </div>

        <Button className="font-semibold gap-1.5 shadow-sm" asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            <span>Add New Product</span>
          </Link>
        </Button>
      </div>

      {/* Products Table Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--text-primary)]">
            <thead className="bg-[var(--surface-muted)] text-[var(--text-muted)] font-semibold border-b border-[var(--border)]">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Base Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/50">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--text-muted)]">
                    No products found in the catalog.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  async function handleToggle() {
                    "use server";
                    await toggleProductActiveAction(p.id, !p.isActive);
                  }

                  async function handleDelete() {
                    "use server";
                    await deleteProductAction(p.id);
                  }

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[var(--surface-muted)]/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--surface-muted)] shrink-0 flex items-center justify-center">
                            {p.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-4 w-4 text-[var(--text-muted)]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="truncate max-w-[220px] block">{p.name}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              {p.sku && (
                                <span className="text-[10px] text-[var(--text-muted)] font-mono font-normal">
                                  {p.sku}
                                </span>
                              )}
                              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                                /{p.slug}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                        {p.categoryName}
                      </td>

                      <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                        {p.brandName}
                      </td>

                      <td className="py-3.5 px-4 font-semibold">
                        {formatMoney(p.basePriceMinor)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            p.totalStock === 0
                              ? "bg-red-500/10 text-red-500"
                              : p.totalStock <= 5
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-emerald-500/10 text-emerald-500"
                          }`}
                        >
                          {p.totalStock} in stock
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {p.isActive ? (
                          <Badge
                            variant="default"
                            className="text-[10px] uppercase font-bold"
                          >
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-[10px] uppercase font-bold text-[var(--text-muted)]"
                          >
                            Inactive
                          </Badge>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/product/${p.slug}`}
                            target="_blank"
                            className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--surface-muted)] transition-colors"
                            title="View storefront page"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>

                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--surface-muted)] transition-colors"
                            title="Edit product"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>

                          <form action={handleToggle} className="inline">
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            >
                              {p.isActive ? "Deactivate" : "Activate"}
                            </Button>
                          </form>

                          <form action={handleDelete} className="inline">
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10"
                              title="Delete product"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </form>
                        </div>
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
  );
}
