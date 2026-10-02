import { describe, it, expect } from "vitest";
import { mergeCarts, calculateCartTotals } from "./merge";
import type { CartItem } from "./types";

const mockItemA: CartItem = {
  variantId: "var-1",
  productId: "prod-1",
  productName: "iPhone 16 Pro Max",
  variantSku: "IP16PM-256",
  variantOptions: { storage: "256GB" },
  priceMinor: 235000000, // ₦2,350,000
  quantity: 1,
  maxStock: 5,
};

const mockItemB: CartItem = {
  variantId: "var-2",
  productId: "prod-2",
  productName: "Sony WH-1000XM5",
  variantSku: "SONY-XM5",
  variantOptions: { color: "Black" },
  priceMinor: 48000000, // ₦480,000
  quantity: 2,
  maxStock: 10,
};

describe("mergeCarts (AGENTS.md §12 / PLAN.md §10)", () => {
  it("combines disjoint items from DB and local cart", () => {
    const dbItems = [mockItemA];
    const localItems = [mockItemB];

    const result = mergeCarts(dbItems, localItems);
    expect(result.length).toBe(2);
    expect(result.find((i) => i.variantId === "var-1")?.quantity).toBe(1);
    expect(result.find((i) => i.variantId === "var-2")?.quantity).toBe(2);
  });

  it("adds quantities when the same variant exists in both carts", () => {
    const dbItems = [{ ...mockItemA, quantity: 2 }];
    const localItems = [{ ...mockItemA, quantity: 1 }];

    const result = mergeCarts(dbItems, localItems);
    expect(result.length).toBe(1);
    expect(result[0].quantity).toBe(3); // 2 + 1 = 3
  });

  it("caps merged quantity at available maxStock", () => {
    const dbItems = [{ ...mockItemA, quantity: 3, maxStock: 4 }];
    const localItems = [{ ...mockItemA, quantity: 3, maxStock: 4 }];

    const result = mergeCarts(dbItems, localItems);
    expect(result.length).toBe(1);
    expect(result[0].quantity).toBe(4); // capped at 4, not 6
  });

  it("discards items with zero or negative quantities", () => {
    const dbItems = [{ ...mockItemA, quantity: 0 }];
    const localItems = [{ ...mockItemB, quantity: -2 }];

    const result = mergeCarts(dbItems, localItems);
    expect(result.length).toBe(0);
  });

  it("handles empty db cart", () => {
    const result = mergeCarts([], [mockItemA]);
    expect(result.length).toBe(1);
    expect(result[0].variantId).toBe(mockItemA.variantId);
  });

  it("handles empty local cart", () => {
    const result = mergeCarts([mockItemA], []);
    expect(result.length).toBe(1);
    expect(result[0].variantId).toBe(mockItemA.variantId);
  });
});

describe("calculateCartTotals", () => {
  it("computes accurate subtotal and item count", () => {
    const items = [mockItemA, mockItemB]; // 1x 235m + 2x 48m = 331m
    const totals = calculateCartTotals(items);

    expect(totals.subtotalMinor).toBe(331000000);
    expect(totals.itemCount).toBe(3);
    expect(totals.qualifiesForFreeShipping).toBe(true);
    expect(totals.amountNeededForFreeShippingMinor).toBe(0);
  });

  it("calculates amount needed for free shipping when under default threshold", () => {
    const cheapItem: CartItem = {
      ...mockItemB,
      priceMinor: 6000000, // ₦60,000 (< ₦100,000 default threshold)
      quantity: 1,
    };
    const totals = calculateCartTotals([cheapItem]);

    expect(totals.subtotalMinor).toBe(6000000);
    expect(totals.itemCount).toBe(1);
    expect(totals.qualifiesForFreeShipping).toBe(false);
    expect(totals.amountNeededForFreeShippingMinor).toBe(4000000); // ₦40,000 needed
  });

  it("calculates amount needed with custom admin threshold", () => {
    const items = [{ ...mockItemB, quantity: 1 }]; // ₦480,000 (< ₦1,000,000 custom threshold)
    const totals = calculateCartTotals(items, 100000000); // ₦1,000,000 custom threshold

    expect(totals.subtotalMinor).toBe(48000000);
    expect(totals.itemCount).toBe(1);
    expect(totals.qualifiesForFreeShipping).toBe(false);
    expect(totals.amountNeededForFreeShippingMinor).toBe(52000000); // ₦520,000 needed
  });

  it("returns zero for empty cart", () => {
    const totals = calculateCartTotals([]);
    expect(totals.subtotalMinor).toBe(0);
    expect(totals.itemCount).toBe(0);
    expect(totals.qualifiesForFreeShipping).toBe(false);
    expect(totals.amountNeededForFreeShippingMinor).toBe(10000000); // default ₦100,000
  });
});
