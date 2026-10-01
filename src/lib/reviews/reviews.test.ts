import { describe, it, expect } from "vitest";
import { calculateReviewSummary, type ReviewItemInput } from "./summary";

describe("Product Reviews Calculations and Summary", () => {
  it("returns default summary when given an empty list of reviews", () => {
    const summary = calculateReviewSummary([]);
    expect(summary.totalReviews).toBe(0);
    expect(summary.averageRating).toBe(5.0);
    expect(summary.reviews).toHaveLength(0);
    expect(summary.ratingDistribution).toEqual({
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    });
  });

  it("accurately calculates single review stats", () => {
    const raw: ReviewItemInput[] = [
      {
        id: "rev-1",
        product_id: "prod-1",
        user_id: "user-1",
        rating: 4,
        title: "Very fast laptop",
        body: "Battery life is excellent for coding.",
        is_verified: true,
        is_approved: true,
        created_at: "2026-03-01T12:00:00Z",
        author_name: "Emeka O.",
      },
    ];

    const summary = calculateReviewSummary(raw);
    expect(summary.totalReviews).toBe(1);
    expect(summary.averageRating).toBe(4.0);
    expect(summary.ratingDistribution[4]).toBe(1);
    expect(summary.ratingDistribution[5]).toBe(0);
    expect(summary.reviews[0].author_name).toBe("Emeka O.");
    expect(summary.reviews[0].is_verified).toBe(true);
  });

  it("calculates multi-rating distributions and rounded averages correctly", () => {
    const raw: ReviewItemInput[] = [
      {
        id: "rev-1",
        product_id: "p1",
        user_id: "u1",
        rating: 5,
        title: "Top tier",
        body: "Flawless",
        is_verified: true,
        is_approved: true,
        created_at: "2026-03-01T10:00:00Z",
      },
      {
        id: "rev-2",
        product_id: "p1",
        user_id: "u2",
        rating: 5,
        title: "Amazing quality",
        body: "Worth every kobo",
        is_verified: false,
        is_approved: true,
        created_at: "2026-03-01T11:00:00Z",
      },
      {
        id: "rev-3",
        product_id: "p1",
        user_id: "u3",
        rating: 4,
        title: "Solid device",
        body: "Slightly heavy charger",
        is_verified: true,
        is_approved: true,
        created_at: "2026-03-01T12:00:00Z",
      },
      {
        id: "rev-4",
        product_id: "p1",
        user_id: "u4",
        rating: 3,
        title: "Average",
        body: "Okay for casual use",
        is_verified: false,
        is_approved: true,
        created_at: "2026-03-01T13:00:00Z",
      },
    ];

    // Total = 5 + 5 + 4 + 3 = 17 / 4 = 4.25 => rounds to 4.3
    const summary = calculateReviewSummary(raw);
    expect(summary.totalReviews).toBe(4);
    expect(summary.averageRating).toBe(4.3);
    expect(summary.ratingDistribution).toEqual({
      5: 2,
      4: 1,
      3: 1,
      2: 0,
      1: 0,
    });
  });

  it("clamps invalid out-of-range ratings to [1, 5] and rounds decimals", () => {
    const raw: ReviewItemInput[] = [
      {
        id: "rev-low",
        product_id: "p1",
        user_id: "u1",
        rating: -2,
        title: "Terrible",
        body: "Broke immediately",
        is_verified: true,
        is_approved: true,
        created_at: "2026-03-01T10:00:00Z",
      },
      {
        id: "rev-high",
        product_id: "p1",
        user_id: "u2",
        rating: 10,
        title: "Mindblowing",
        body: "Off the charts",
        is_verified: true,
        is_approved: true,
        created_at: "2026-03-01T11:00:00Z",
      },
      {
        id: "rev-dec",
        product_id: "p1",
        user_id: "u3",
        rating: 3.7,
        title: "Almost 4",
        body: "Rounded up",
        is_verified: false,
        is_approved: true,
        created_at: "2026-03-01T12:00:00Z",
      },
    ];

    const summary = calculateReviewSummary(raw);
    expect(summary.ratingDistribution[1]).toBe(1); // clamped from -2
    expect(summary.ratingDistribution[5]).toBe(1); // clamped from 10
    expect(summary.ratingDistribution[4]).toBe(1); // rounded from 3.7
    // Average = (1 + 5 + 4) / 3 = 3.3
    expect(summary.averageRating).toBe(3.3);
  });

  it("falls back to default author name when author display name is null or undefined", () => {
    const raw: ReviewItemInput[] = [
      {
        id: "rev-anon",
        product_id: "p1",
        user_id: "u1",
        rating: 5,
        title: "Great product",
        body: "Highly recommended",
        is_verified: true,
        is_approved: true,
        created_at: "2026-03-01T10:00:00Z",
        author_name: null,
      },
    ];

    const summary = calculateReviewSummary(raw);
    expect(summary.reviews[0].author_name).toBe("Verified Customer");
  });
});
