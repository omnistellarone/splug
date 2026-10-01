/**
 * Transactional Email Types — AGENTS.md §17, PLAN.md §12
 */

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  templateKey:
    | "order-confirmation"
    | "order-processing"
    | "order-shipped"
    | "order-delivered"
    | "order-cancelled"
    | "order-refunded"
    | "general";
  orderId?: string;
  userId?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
}

export interface OrderEmailItem {
  name: string;
  variantName?: string;
  sku?: string;
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
  imageUrl?: string | null;
}

export interface OrderEmailData {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  status: string;
  subtotalMinor: number;
  shippingMinor: number;
  discountMinor: number;
  totalMinor: number;
  couponCode?: string | null;
  shippingAddress: {
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string | null;
    city: string;
    state: string;
    country?: string;
  };
  items: OrderEmailItem[];
  paymentReference?: string | null;
  paidAt?: string | null;
}
