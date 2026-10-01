/**
 * Order calculation helpers — AGENTS.md §5, §10, §11
 *
 * Rules:
 * - All calculations in integer minor units (kobo).
 * - Avoid floating-point arithmetic.
 * - Totals must never be negative.
 * - Discount cannot exceed subtotal.
 */

export interface OrderItemInput {
  priceMinor: number;
  quantity: number;
}

export interface OrderCalculationInput {
  items: OrderItemInput[];
  shippingMinor?: number;
  discountMinor?: number;
}

export interface OrderCalculationResult {
  subtotalMinor: number;
  shippingMinor: number;
  discountMinor: number;
  totalMinor: number;
}

export function calculateOrderTotals(input: OrderCalculationInput): OrderCalculationResult {
  const subtotalMinor = input.items.reduce((acc, item) => {
    if (item.quantity <= 0) {
      throw new Error(`Quantity must be greater than zero, received ${item.quantity}`);
    }
    if (item.priceMinor < 0) {
      throw new Error(`Price must be non-negative, received ${item.priceMinor}`);
    }
    return acc + Math.round(item.priceMinor) * Math.round(item.quantity);
  }, 0);

  const shippingMinor = Math.max(0, Math.round(input.shippingMinor ?? 0));
  const requestedDiscount = Math.max(0, Math.round(input.discountMinor ?? 0));
  const discountMinor = Math.min(subtotalMinor, requestedDiscount);
  const totalMinor = Math.max(0, subtotalMinor - discountMinor + shippingMinor);

  return {
    subtotalMinor,
    shippingMinor,
    discountMinor,
    totalMinor,
  };
}
