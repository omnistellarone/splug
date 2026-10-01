export interface ReviewRecord {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified: boolean;
  is_approved: boolean;
  created_at: string;
  author_name: string;
}

export interface ProductReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
  reviews: ReviewRecord[];
}

export interface CreateReviewInput {
  productId: string;
  rating: number;
  title: string;
  body: string;
}
