import { describe, it, expect } from "vitest";
import { calculateOrderTotals } from "./order";

describe("calculateOrderTotals", () => {
  it("calculates subtotal and total accurately for single item", () => {
    const result = calculateOrderTotals({
      items: [{ priceMinor: 15000000, quantity: 1 }], // ₦150,000
    });
    expect(result.subtotalMinor).toBe(15000000);
    expect(result.totalMinor).toBe(15000000);
    expect(result.discountMinor).toBe(0);
    expect(result.shippingMinor).toBe(0);
  });

  it("calculates multiple items correctly", () => {
    const result = calculateOrderTotals({
      items: [
        { priceMinor: 10000000, quantity: 2 }, // 2x ₦100,000 = ₦200,000
        { priceMinor: 2500000, quantity: 3 },  // 3x ₦25,000 = ₦75,000
      ],
      shippingMinor: 350000, // ₦3,500 shipping
    });
    expect(result.subtotalMinor).toBe(27500000);
    expect(result.shippingMinor).toBe(350000);
    expect(result.totalMinor).toBe(27850000);
  });

  it("applies discount correctly without exceeding subtotal", () => {
    const result = calculateOrderTotals({
      items: [{ priceMinor: 5000000, quantity: 1 }], // ₦50,000
      discountMinor: 6000000, // ₦60,000 discount attempted
      shippingMinor: 200000,  // ₦2,000 shipping
    });
    expect(result.subtotalMinor).toBe(5000000);
    expect(result.discountMinor).toBe(5000000); // capped at subtotal
    expect(result.totalMinor).toBe(200000);      // only shipping remains
  });

  it("throws error for non-positive quantity", () => {
    expect(() =>
      calculateOrderTotals({
        items: [{ priceMinor: 5000000, quantity: 0 }],
      })
    ).toThrowError(/Quantity must be greater than zero/);
  });

  it("throws error for negative price", () => {
    expect(() =>
      calculateOrderTotals({
        items: [{ priceMinor: -100, quantity: 1 }],
      })
    ).toThrowError(/Price must be non-negative/);
  });
});
