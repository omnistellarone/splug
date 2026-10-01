import type { ReviewRecord, ProductReviewSummary } from "./types";

export interface ReviewItemInput {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified: boolean;
  is_approved: boolean;
  created_at: string;
  author_name?: string | null;
}

/**
 * Pure function to calculate average rating, star breakdown, and review summaries
 */
export function calculateReviewSummary(
  rawReviews: ReviewItemInput[]
): ProductReviewSummary {
  const ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number> = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  if (!rawReviews || rawReviews.length === 0) {
    return {
      averageRating: 5.0,
      totalReviews: 0,
      ratingDistribution,
      reviews: [],
    };
  }

  let sum = 0;
  const reviews: ReviewRecord[] = [];

  for (const r of rawReviews) {
    const validRating = Math.max(1, Math.min(5, Math.round(r.rating))) as
      | 1
      | 2
      | 3
      | 4
      | 5;
    ratingDistribution[validRating] = (ratingDistribution[validRating] || 0) + 1;
    sum += validRating;

    reviews.push({
      id: r.id,
      product_id: r.product_id,
      user_id: r.user_id,
      rating: validRating,
      title: r.title,
      body: r.body,
      is_verified: r.is_verified,
      is_approved: r.is_approved,
      created_at: r.created_at,
      author_name: r.author_name || "Verified Customer",
    });
  }

  const averageRating = Number((sum / reviews.length).toFixed(1));

  return {
    averageRating,
    totalReviews: reviews.length,
    ratingDistribution,
    reviews,
  };
}
