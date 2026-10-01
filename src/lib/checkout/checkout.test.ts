import { describe, it, expect } from "vitest";
import { calculateOrderTotals } from "@/lib/order";
import { calculateCouponDiscount } from "@/lib/coupon";
import { verifyPaystackSignature } from "@/lib/paystack/signature";
import { createHmac } from "crypto";
import type { Coupon } from "@/lib/types/database";

describe("Phase 5: Checkout & Payment Integrity", () => {
  describe("Order Total Calculation in Minor Units", () => {
    it("calculates correct grand total with standard shipping", () => {
      const result = calculateOrderTotals({
        items: [
          { priceMinor: 85000000, quantity: 1 }, // iPhone ₦850,000
          { priceMinor: 4500000, quantity: 2 }, // Case ₦45,000 x 2
        ],
        shippingMinor: 350000, // ₦3,500 shipping
        discountMinor: 0,
      });

      expect(result.subtotalMinor).toBe(94000000);
      expect(result.shippingMinor).toBe(350000);
      expect(result.totalMinor).toBe(94350000);
    });

    it("applies free shipping when subtotal exceeds ₦1,000,000 threshold", () => {
      const items = [{ priceMinor: 145000000, quantity: 1 }]; // MacBook ₦1,450,000
      const subtotal = items[0].priceMinor * items[0].quantity;
      const FREE_SHIPPING_THRESHOLD_MINOR = 100000000;
      const shipping = subtotal >= FREE_SHIPPING_THRESHOLD_MINOR ? 0 : 350000;

      const result = calculateOrderTotals({
        items,
        shippingMinor: shipping,
        discountMinor: 0,
      });

      expect(result.shippingMinor).toBe(0);
      expect(result.totalMinor).toBe(145000000);
    });

    it("ensures discount cannot exceed subtotal (never negative total)", () => {
      const result = calculateOrderTotals({
        items: [{ priceMinor: 5000000, quantity: 1 }],
        shippingMinor: 350000,
        discountMinor: 10000000, // discount greater than subtotal
      });

      expect(result.discountMinor).toBe(5000000);
      expect(result.totalMinor).toBe(350000); // only shipping remains
    });
  });

  describe("Coupon Discount Application", () => {
    const samplePercentageCoupon: Pick<
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
    > = {
      is_active: true,
      discount_type: "percentage",
      discount_value: 10, // 10%
      min_order_minor: 5000000, // Min ₦50,000
      max_discount_minor: 2000000, // Max discount ₦20,000
      starts_at: new Date(Date.now() - 3600000).toISOString(),
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      max_uses: 100,
      used_count: 5,
    };

    it("correctly calculates capped percentage discount", () => {
      // 10% of ₦500,000 (50,000,000 kobo) is ₦50,000 (5,000,000 kobo), capped at ₦20,000 (2,000,000 kobo)
      const res = calculateCouponDiscount(samplePercentageCoupon, 50000000);
      expect(res.valid).toBe(true);
      expect(res.discountMinor).toBe(2000000);
    });

    it("rejects coupon when subtotal does not meet minimum order requirement", () => {
      const res = calculateCouponDiscount(samplePercentageCoupon, 4000000); // ₦40,000 < ₦50,000 min
      expect(res.valid).toBe(false);
      expect(res.discountMinor).toBe(0);
    });
  });

  describe("Paystack Webhook & Idempotency Invariants", () => {
    const testSecret = "sk_test_paystack_secret_key_987654321";

    it("verifies authentic webhook payload with HMAC SHA-512", () => {
      const payload = JSON.stringify({
        event: "charge.success",
        data: {
          reference: "splug_1727801234567_abc",
          amount: 54000000,
          status: "success",
        },
      });

      const signature = createHmac("sha512", testSecret)
        .update(payload)
        .digest("hex");

      expect(verifyPaystackSignature(payload, signature, testSecret)).toBe(true);
    });

    it("rejects forged or modified webhook payload", () => {
      const legitimatePayload = JSON.stringify({
        event: "charge.success",
        data: { reference: "splug_1727801234567_abc", amount: 54000000 },
      });

      const forgedSignature = createHmac("sha512", testSecret)
        .update(legitimatePayload)
        .digest("hex");

      const modifiedPayload = JSON.stringify({
        event: "charge.success",
        data: { reference: "splug_1727801234567_abc", amount: 1000 }, // altered amount
      });

      expect(verifyPaystackSignature(modifiedPayload, forgedSignature, testSecret)).toBe(false);
    });
  });
});
