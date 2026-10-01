import type { CartItem, CartTotals } from "./types";
import { FREE_SHIPPING_THRESHOLD_MINOR } from "./types";

/**
 * Safely merge local guest items into authoritative database items.
 *
 * Rules (AGENTS.md §12):
 * - If item already exists, add quantities together up to permitted stock.
 * - If quantity <= 0, drop the item.
 * - Cap quantity at maxStock.
 * - Pure function without side effects.
 */
export function mergeCarts(
  dbItems: CartItem[],
  localItems: CartItem[]
): CartItem[] {
  const mergedMap = new Map<string, CartItem>();

  // 1. Add all DB items first (canonical source)
  for (const item of dbItems) {
    if (item.quantity > 0) {
      const safeQty = Math.min(item.quantity, item.maxStock);
      if (safeQty > 0) {
        mergedMap.set(item.variantId, {
          ...item,
          quantity: safeQty,
        });
      }
    }
  }

  // 2. Merge local items
  for (const local of localItems) {
    if (local.quantity <= 0) continue;

    const existing = mergedMap.get(local.variantId);
    if (existing) {
      // Add quantities, but never exceed available stock
      const combinedQty = Math.min(
        existing.quantity + local.quantity,
        existing.maxStock
      );
      mergedMap.set(local.variantId, {
        ...existing,
        quantity: combinedQty,
      });
    } else {
      const safeQty = Math.min(local.quantity, local.maxStock);
      if (safeQty > 0) {
        mergedMap.set(local.variantId, {
          ...local,
          quantity: safeQty,
        });
      }
    }
  }

  return Array.from(mergedMap.values());
}

/**
 * Calculate totals and free shipping progress
 */
export function calculateCartTotals(items: CartItem[]): CartTotals {
  let subtotalMinor = 0;
  let itemCount = 0;

  for (const item of items) {
    if (item.quantity > 0 && item.priceMinor >= 0) {
      subtotalMinor += item.priceMinor * item.quantity;
      itemCount += item.quantity;
    }
  }

  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD_MINOR - subtotalMinor);

  return {
    subtotalMinor,
    itemCount,
    freeShippingThresholdMinor: FREE_SHIPPING_THRESHOLD_MINOR,
    amountNeededForFreeShippingMinor: amountNeeded,
    qualifiesForFreeShipping: amountNeeded === 0,
  };
}
