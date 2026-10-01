import { describe, it, expect } from "vitest";
import { calculateCouponDiscount } from "./coupon";

describe("calculateCouponDiscount", () => {
  const baseCoupon = {
    is_active: true,
    discount_type: "percentage" as const,
    discount_value: 10, // 10%
    min_order_minor: 500000, // ₦5,000 min order
    max_discount_minor: null,
    starts_at: "2026-01-01T00:00:00Z",
    expires_at: "2026-12-31T23:59:59Z",
    max_uses: 100,
    used_count: 10,
  };

  it("calculates percentage discount accurately", () => {
    const result = calculateCouponDiscount(baseCoupon, 1000000); // ₦10,000 subtotal
    expect(result.valid).toBe(true);
    expect(result.discountMinor).toBe(100000); // ₦1,000 (10%)
  });

  it("respects max_discount_minor cap on percentage discount", () => {
    const cappedCoupon = {
      ...baseCoupon,
      max_discount_minor: 50000, // ₦500 cap
    };
    const result = calculateCouponDiscount(cappedCoupon, 1000000);
    expect(result.valid).toBe(true);
    expect(result.discountMinor).toBe(50000); // capped at ₦500
  });

  it("calculates fixed minor discount accurately", () => {
    const fixedCoupon = {
      ...baseCoupon,
      discount_type: "fixed_minor" as const,
      discount_value: 200000, // ₦2,000 fixed
    };
    const result = calculateCouponDiscount(fixedCoupon, 1000000);
    expect(result.valid).toBe(true);
    expect(result.discountMinor).toBe(200000);
  });

  it("does not allow fixed discount to exceed subtotal", () => {
    const fixedCoupon = {
      ...baseCoupon,
      discount_type: "fixed_minor" as const,
      discount_value: 1500000, // ₦15,000 fixed
      min_order_minor: 0,
    };
    const result = calculateCouponDiscount(fixedCoupon, 1000000); // ₦10,000 subtotal
    expect(result.valid).toBe(true);
    expect(result.discountMinor).toBe(1000000); // limited to subtotal
  });

  it("rejects inactive coupon", () => {
    const result = calculateCouponDiscount({ ...baseCoupon, is_active: false }, 1000000);
    expect(result.valid).toBe(false);
    expect(result.discountMinor).toBe(0);
  });

  it("rejects expired coupon", () => {
    const expiredCoupon = {
      ...baseCoupon,
      expires_at: "2025-01-01T00:00:00Z",
    };
    const result = calculateCouponDiscount(
      expiredCoupon,
      1000000,
      new Date("2026-10-01T00:00:00Z")
    );
    expect(result.valid).toBe(false);
    expect(result.discountMinor).toBe(0);
  });

  it("rejects coupon when usage limit is reached", () => {
    const maxedCoupon = {
      ...baseCoupon,
      max_uses: 50,
      used_count: 50,
    };
    const result = calculateCouponDiscount(maxedCoupon, 1000000);
    expect(result.valid).toBe(false);
    expect(result.discountMinor).toBe(0);
  });

  it("rejects order below min_order_minor", () => {
    const result = calculateCouponDiscount(baseCoupon, 400000); // below ₦5,000
    expect(result.valid).toBe(false);
    expect(result.discountMinor).toBe(0);
  });
});
