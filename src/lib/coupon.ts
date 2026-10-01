import type { Coupon } from "./types/database";

export interface CouponValidationResult {
  valid: boolean;
  error?: string;
  discountMinor: number;
}

export function calculateCouponDiscount(
  coupon: Pick<
    Coupon,
    | "is_active"
    | "discount_type"
    | "discount_value"
    | "min_order_minor"
    | "max_discount_minor"
    | "starts_at"
    | "expires_at"
    | "max_uses"
    | "used_count"
  >,
  subtotalMinor: number,
  now: Date = new Date()
): CouponValidationResult {
  if (!coupon.is_active) {
    return { valid: false, error: "Coupon is inactive", discountMinor: 0 };
  }

  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { valid: false, error: "Coupon is not yet active", discountMinor: 0 };
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { valid: false, error: "Coupon has expired", discountMinor: 0 };
  }

  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    return { valid: false, error: "Coupon usage limit reached", discountMinor: 0 };
  }

  if (subtotalMinor < coupon.min_order_minor) {
    return {
      valid: false,
      error: `Minimum order amount not met`,
      discountMinor: 0,
    };
  }

  let discount = 0;
  if (coupon.discount_type === "percentage") {
    // Integer minor units — round down to avoid fractional minor units
    discount = Math.floor((subtotalMinor * coupon.discount_value) / 100);
    if (coupon.max_discount_minor !== null && coupon.max_discount_minor !== undefined) {
      discount = Math.min(discount, coupon.max_discount_minor);
    }
  } else if (coupon.discount_type === "fixed_minor") {
    // Fixed amount cannot exceed the subtotal
    discount = Math.min(coupon.discount_value, subtotalMinor);
  }

  return {
    valid: true,
    discountMinor: discount,
  };
}
