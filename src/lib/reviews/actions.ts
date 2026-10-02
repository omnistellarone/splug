"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { calculateReviewSummary } from "./summary";
import type {
  ProductReviewSummary,
  CreateReviewInput,
  ReviewRecord,
} from "./types";

interface DbReviewRow {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified: boolean;
  is_approved: boolean;
  created_at: string;
}

/**
 * Fetch approved product reviews and rating summary
 */
export async function getProductReviewsAction(
  productId: string
): Promise<ProductReviewSummary> {
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  // Query reviews for this product (approved, plus current user's unapproved reviews if signed in)
  let query = supabase
    .from("reviews")
    .select(`
      id,
      product_id,
      user_id,
      rating,
      title,
      body,
      is_verified,
      is_approved,
      created_at
    `)
    .eq("product_id", productId);

  if (currentUser) {
    query = query.or(`is_approved.eq.true,user_id.eq.${currentUser.id}`);
  } else {
    query = query.eq("is_approved", true);
  }

  const { data: rawReviews, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error || !rawReviews || rawReviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      reviews: [],
    };
  }

  const reviewsList = rawReviews as DbReviewRow[];

  // Retrieve reviewer display names from profiles table using admin client (bypasses RLS)
  const userIds = [...new Set(reviewsList.map((r) => r.user_id).filter(Boolean))];
  const userMap = new Map<string, string>();

  if (userIds.length > 0) {
    try {
      const admin = createAdminClient();
      const { data: profiles } = await admin
        .from("profiles")
        .select("id, display_name")
        .in("id", userIds);

      if (profiles) {
        for (const p of profiles) {
          if (p.display_name) {
            userMap.set(p.id, p.display_name);
          }
        }
      }
    } catch (e) {
      console.warn("Could not look up reviewer profiles:", e);
    }
  }

  return calculateReviewSummary(
    reviewsList.map((r) => {
      let authorName = userMap.get(r.user_id);
      if (!authorName) {
        authorName = currentUser && currentUser.id === r.user_id ? "You" : "Verified Customer";
      }
      return {
        id: r.id,
        product_id: r.product_id,
        user_id: r.user_id,
        rating: r.rating,
        title: r.title,
        body: r.body,
        is_verified: r.is_verified,
        is_approved: r.is_approved,
        created_at: r.created_at,
        author_name: authorName,
      };
    })
  );
}

/**
 * Submit a customer product review with verified purchase detection
 */
export async function createReviewAction(
  input: CreateReviewInput
): Promise<{ success: boolean; review?: ReviewRecord; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please sign in to write a review." };
  }

  const rating = Math.max(1, Math.min(5, Math.round(input.rating)));
  if (!input.title.trim()) {
    return { success: false, error: "Please enter a review headline." };
  }
  if (!input.body.trim()) {
    return { success: false, error: "Please write your review feedback." };
  }

  // Check if customer is a verified buyer (has paid order with this product)
  const { data: purchaseOrder } = await supabase
    .from("order_items")
    .select("id, orders!inner(user_id, status, payment_status)")
    .eq("orders.user_id", user.id)
    .eq("orders.payment_status", "paid")
    .limit(1)
    .maybeSingle();

  const isVerifiedBuyer = !!purchaseOrder;

  // Insert or update review (one review per user per product)
  const { data: insertedReview, error } = await supabase
    .from("reviews")
    .upsert(
      {
        product_id: input.productId,
        user_id: user.id,
        rating,
        title: input.title.trim(),
        body: input.body.trim(),
        is_verified: isVerifiedBuyer,
        is_approved: true, // auto-approve standard reviews
        updated_at: new Date().toISOString(),
      },
      { onConflict: "product_id, user_id" }
    )
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Fetch author display name
  let authorName = "You";
  try {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.display_name) {
      authorName = profile.display_name;
    }
  } catch {
    // Keep "You"
  }

  revalidatePath(`/product/[slug]`, "page");
  revalidatePath("/admin/reviews");

  return {
    success: true,
    review: {
      id: insertedReview.id,
      product_id: insertedReview.product_id,
      user_id: insertedReview.user_id,
      rating: insertedReview.rating,
      title: insertedReview.title,
      body: insertedReview.body,
      is_verified: insertedReview.is_verified,
      is_approved: insertedReview.is_approved,
      created_at: insertedReview.created_at,
      author_name: authorName,
    },
  };
}
