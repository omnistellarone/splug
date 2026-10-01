"use client";

import * as React from "react";
import {
  Star,
  ShieldCheck,
  Plus,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  getProductReviewsAction,
  createReviewAction,
} from "@/lib/reviews/actions";
import type { ProductReviewSummary } from "@/lib/reviews/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const [data, setData] = React.useState<ProductReviewSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);

  // Form state
  const [rating, setRating] = React.useState(5);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const refreshReviews = React.useCallback(async () => {
    const result = await getProductReviewsAction(productId);
    setData(result);
  }, [productId]);

  React.useEffect(() => {
    let isMounted = true;
    getProductReviewsAction(productId).then((result) => {
      if (isMounted) {
        setData(result);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    setSubmitting(true);
    const res = await createReviewAction({
      productId,
      rating,
      title,
      body,
    });
    setSubmitting(false);

    if (res.success) {
      setSuccessMsg("Thank you! Your verified review has been published.");
      setShowForm(false);
      setTitle("");
      setBody("");
      refreshReviews();
    } else {
      setFormError(res.error || "Failed to submit review.");
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-2">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
        <span className="text-xs text-[var(--text-muted)]">Loading reviews…</span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 pt-6 border-t border-[var(--border)]">
      {/* ── Section Header & Summary ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
            Verified Customer Reviews
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Real feedback from verified electronics buyers
          </p>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          className="font-semibold gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>{showForm ? "Cancel Review" : "Write a Review"}</span>
        </Button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-[var(--success-soft)] text-[var(--success)] text-xs sm:text-sm flex items-center gap-2 border border-[var(--success)]/20 animate-in fade-in-0 duration-200">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── Review Form ── */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[var(--primary)]/30 bg-[var(--surface)] p-6 space-y-4 shadow-xl animate-in fade-in-0 duration-200"
        >
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Write a Review for {productName}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Share your genuine feedback on quality, delivery, and performance.
            </p>
          </div>

          {formError && (
            <div className="p-3 rounded-lg bg-[var(--danger-soft)] text-[var(--danger)] text-xs">
              {formError}
            </div>
          )}

          {/* Star selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Your Rating *</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={cn(
                      "h-6 w-6",
                      (hoverRating || rating) >= star
                        ? "fill-current text-amber-400"
                        : "text-[var(--text-muted)]"
                    )}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-[var(--text-primary)] ml-2">
                {rating} out of 5 stars
              </span>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-1.5">
            <Label htmlFor="reviewTitle" className="text-xs font-semibold">
              Review Headline *
            </Label>
            <Input
              id="reviewTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Excellent build quality, swift Lagos delivery!"
              className="h-10 text-xs"
            />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <Label htmlFor="reviewBody" className="text-xs font-semibold">
              Detailed Feedback *
            </Label>
            <textarea
              id="reviewBody"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Tell other shoppers what you liked or how this electronics gadget performed in your setup…"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting} className="font-semibold">
              {submitting ? "Publishing…" : "Publish Review"}
            </Button>
          </div>
        </form>
      )}

      {/* ── Ratings Overview Breakdown ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        {/* Score column */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center space-y-2 border-b md:border-b-0 md:border-r border-[var(--border)] pb-6 md:pb-0 md:pr-6">
          <div className="text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {data.averageRating.toFixed(1)}
          </div>
          <div className="flex items-center text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={cn(
                  "h-4 w-4",
                  data.averageRating >= s ? "fill-current" : "opacity-30"
                )}
              />
            ))}
          </div>
          <p className="text-xs text-[var(--text-muted)] font-medium">
            Based on {data.totalReviews} verified ratings
          </p>
        </div>

        {/* Rating bars column */}
        <div className="md:col-span-8 space-y-2">
          {([5, 4, 3, 2, 1] as const).map((num) => {
            const count = data.ratingDistribution[num] || 0;
            const percentage =
              data.totalReviews > 0
                ? Math.round((count / data.totalReviews) * 100)
                : 0;

            return (
              <div key={num} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-medium text-[var(--text-secondary)]">
                  {num} stars
                </span>
                <div className="flex-1 h-2 rounded-full bg-[var(--surface-subtle)] overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-[11px] text-[var(--text-muted)] font-semibold">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Individual Reviews List ── */}
      <div className="space-y-4">
        {data.reviews.map((rev) => {
          const dateStr = new Date(rev.created_at).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });

          return (
            <div
              key={rev.id}
              className="p-5 sm:p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-3 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[var(--text-primary)]">
                      {rev.author_name}
                    </span>
                    {rev.is_verified && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[var(--success)] font-semibold bg-[var(--success-soft)] px-2 py-0.5 rounded-md">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Verified Buyer</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={cn(
                            "h-3.5 w-3.5",
                            rev.rating >= s ? "fill-current" : "opacity-20"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {dateStr}
                    </span>
                  </div>
                </div>
              </div>

              {rev.title && (
                <h4 className="font-bold text-sm text-[var(--text-primary)]">
                  {rev.title}
                </h4>
              )}

              {rev.body && (
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {rev.body}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
