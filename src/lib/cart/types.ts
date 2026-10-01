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

export const FREE_SHIPPING_THRESHOLD_MINOR = 100000000; // ₦1,000,000 (1 million Naira)
