import * as React from "react";
import type { Metadata } from "next";
import {
  Star,
  ShieldCheck,
  Check,
  X,
} from "@/components/ui/icons";
import {
  getAdminReviewsAction,
  moderateReviewAction,
} from "@/lib/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Review Moderation — Slurge Admin",
  description: "Approve or reject customer product reviews.",
};

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviewsAction();

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-300">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Review Moderation
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
          Verify authentic customer feedback and moderate published store reviews
        </p>
      </div>

      {/* Reviews Table Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--text-primary)]">
            <thead className="bg-[var(--surface-muted)] text-[var(--text-muted)] font-semibold border-b border-[var(--border)]">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Headline & Feedback</th>
                <th className="py-3 px-4">Verified</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/50">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--text-muted)]">
                    No customer reviews submitted yet.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => {
                  async function handleModerate(isApproved: boolean) {
                    "use server";
                    await moderateReviewAction(r.id, isApproved);
                  }

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-[var(--surface-muted)]/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-[var(--text-primary)] max-w-[180px] truncate">
                        {r.productName}
                      </td>

                      <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                        {r.authorName}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span>{r.rating}.0</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-[280px]">
                        <div className="font-bold text-[var(--text-primary)] truncate">
                          {r.title || "No headline"}
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mt-0.5">
                          {r.body}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {r.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-semibold">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-[var(--text-muted)]">
                            Standard
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant={r.isApproved ? "default" : "secondary"}
                          className="text-[10px] uppercase font-bold"
                        >
                          {r.isApproved ? "Approved" : "Pending"}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {!r.isApproved ? (
                            <form action={() => handleModerate(true)}>
                              <Button
                                type="submit"
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-[11px] text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10 gap-1"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>Approve</span>
                              </Button>
                            </form>
                          ) : (
                            <form action={() => handleModerate(false)}>
                              <Button
                                type="submit"
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-[11px] text-[var(--danger)] hover:bg-[var(--danger-soft)] gap-1"
                              >
                                <X className="h-3.5 w-3.5" />
                                <span>Reject</span>
                              </Button>
                            </form>
                          )}
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
