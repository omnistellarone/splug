import { describe, it, expect } from "vitest";
import { mergeCarts, calculateCartTotals } from "./cart/merge";
import type { CartItem } from "./cart/types";

describe("Mobile API & Data Layer Tests", () => {
  const sampleLocalItem: CartItem = {
    variantId: "var-1",
    productId: "prod-1",
    productName: "iPhone 16 Pro Max",
    variantSku: "IPH16-256-TI",
    variantOptions: { Storage: "256GB", Color: "Natural Titanium" },
    priceMinor: 250000000,
    quantity: 2,
    maxStock: 10,
  };

  const sampleDbItem: CartItem = {
    variantId: "var-2",
    productId: "prod-2",
    productName: "Sony WH-1000XM5",
    variantSku: "SONY-WH-BLK",
    variantOptions: { Color: "Black" },
    priceMinor: 55000000,
    quantity: 1,
    maxStock: 5,
  };

  it("merges local guest cart items with remote database cart on login", () => {
    const merged = mergeCarts([sampleDbItem], [sampleLocalItem]);
    expect(merged).toHaveLength(2);
    expect(merged.find((i) => i.variantId === "var-1")?.quantity).toBe(2);
    expect(merged.find((i) => i.variantId === "var-2")?.quantity).toBe(1);
  });

  it("correctly combines quantities when guest cart has duplicate item already in DB", () => {
    const duplicateGuestItem: CartItem = {
      ...sampleDbItem,
      quantity: 2,
    };
    const merged = mergeCarts([sampleDbItem], [duplicateGuestItem]);
    expect(merged).toHaveLength(1);
    // Quantity should combine: 1 + 2 = 3 (capped at maxStock: 5)
    expect(merged[0].quantity).toBe(3);
  });

  it("calculates cart totals including free shipping progress", () => {
    // Free shipping threshold is ₦1,000,000 (100,000,000 minor units)
    const thresholdMinor = 100000000;
    const totals = calculateCartTotals([sampleLocalItem], thresholdMinor);

    expect(totals.subtotalMinor).toBe(500000000); // 2 * 250,000,000
    expect(totals.qualifiesForFreeShipping).toBe(true);
    expect(totals.amountNeededForFreeShippingMinor).toBe(0);
    expect(totals.itemCount).toBe(2);
  });

  it("calculates amount needed for free shipping when below threshold", () => {
    const cheapItem: CartItem = {
      variantId: "var-case",
      productId: "prod-case",
      productName: "Silicone Case",
      variantSku: "CASE-01",
      variantOptions: {},
      priceMinor: 25000000, // ₦250,000 (25,000,000 minor units)
      quantity: 1,
      maxStock: 20,
    };

    const thresholdMinor = 100000000; // ₦1,000,000
    const totals = calculateCartTotals([cheapItem], thresholdMinor);

    expect(totals.subtotalMinor).toBe(25000000);
    expect(totals.qualifiesForFreeShipping).toBe(false);
    expect(totals.amountNeededForFreeShippingMinor).toBe(75000000); // ₦750,000 needed
  });
});
