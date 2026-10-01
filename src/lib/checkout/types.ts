/**
 * Checkout Domain Types — AGENTS.md §10, §11, §15
 * Strict typing for addresses, order line snapshots, and minor unit amounts.
 */

export interface ShippingAddressSnapshot {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  country: string;
}

export interface CheckoutItemInput {
  variantId: string;
  quantity: number;
}

export interface CheckoutTotals {
  subtotalMinor: number;
  shippingMinor: number;
  discountMinor: number;
  totalMinor: number;
  couponCode?: string;
}

export interface CreateOrderParams {
  shippingAddress: ShippingAddressSnapshot;
  couponCode?: string;
  items: CheckoutItemInput[];
  customerNote?: string;
}

export interface CheckoutInitResult {
  success: boolean;
  authorizationUrl?: string;
  reference?: string;
  orderId?: string;
  error?: string;
  redirect?: string;
}
