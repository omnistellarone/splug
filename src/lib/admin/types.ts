import type { OrderStatus, PaymentStatus, DiscountType } from "@/lib/types/database";

export interface AdminAnalyticsSummary {
  totalRevenueMinor: number;
  totalPaidOrders: number;
  totalCustomers: number;
  averageOrderValueMinor: number;
  lowStockCount: number;
  recentOrders: {
    id: string;
    createdAt: string;
    customerName: string;
    totalMinor: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
  }[];
  lowStockVariants: {
    variantId: string;
    productId: string;
    productName: string;
    sku: string;
    stock: number;
    priceMinor: number;
  }[];
}

export interface AdminProductItem {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  brandName: string;
  isActive: boolean;
  basePriceMinor: number;
  totalStock: number;
  variantCount: number;
  imageUrl?: string | null;
  sku?: string;
}

export interface AdminOrderItem {
  id: string;
  createdAt: string;
  shippingName: string;
  shippingCity: string;
  shippingState: string;
  totalMinor: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  itemsCount: number;
}

export interface AdminCouponItem {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrderMinor: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
}

export interface AdminReviewItem {
  id: string;
  productName: string;
  productId: string;
  authorName: string;
  rating: number;
  title: string | null;
  body: string | null;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface AdminCustomerItem {
  id: string;
  displayName: string;
  email?: string;
  phone: string | null;
  orderCount: number;
  totalSpentMinor: number;
  createdAt: string;
}
