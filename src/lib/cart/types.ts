export interface CartItem {
  variantId: string;
  productId: string;
  productSlug?: string;
  productName: string;
  variantSku: string;
  variantOptions: Record<string, string>;
  priceMinor: number;
  image?: string;
  quantity: number;
  maxStock: number;
}

export interface CartTotals {
  subtotalMinor: number;
  itemCount: number;
  freeShippingThresholdMinor: number;
  amountNeededForFreeShippingMinor: number;
  qualifiesForFreeShipping: boolean;
}

export const DEFAULT_FREE_SHIPPING_THRESHOLD_MINOR = 10000000; // ₦100,000 (100k Naira default, configurable by admin)
export const FREE_SHIPPING_THRESHOLD_MINOR = DEFAULT_FREE_SHIPPING_THRESHOLD_MINOR;
