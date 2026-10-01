/**
 * Supabase database type definitions — generated scaffold.
 * Run `npm run db:types` to regenerate from the live schema.
 * PLAN.md §4
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrderStatus =
  | "pending"
  | "payment_init"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "initiated"
  | "paid"
  | "failed"
  | "refunded";

export type DiscountType = "percentage" | "fixed_minor";

export type InventoryReason =
  | "purchase"
  | "restock"
  | "adjustment"
  | "return"
  | "damaged";

// ── Domain row types ──────────────────────────────────────────────────────────

export interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "customer";
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  brand_id: string | null;
  is_active: boolean;
  is_archived: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  /** Price in integer minor units (kobo). Never use for display directly. */
  price_minor: number;
  /** Compare-at price in kobo. Null if no sale. */
  compare_at_minor: number | null;
  options: Record<string, string>;
  stock: number;
  is_active: boolean;
  weight_grams: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  variant_id: string | null;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  variant_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string | null;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  min_order_minor: number;
  max_discount_minor: number | null;
  max_uses: number | null;
  used_count: number;
  max_uses_per_user: number;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  shipping_name: string;
  shipping_phone: string;
  shipping_address1: string;
  shipping_address2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
  /** All in minor units (kobo). */
  subtotal_minor: number;
  shipping_minor: number;
  discount_minor: number;
  total_minor: number;
  coupon_code: string | null;
  coupon_discount_minor: number | null;
  payment_reference: string | null;
  customer_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string | null;
  product_name: string;
  variant_sku: string;
  variant_options: Record<string, string>;
  unit_price_minor: number;
  quantity: number;
  line_total_minor: number;
  image_url: string | null;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  order_id: string;
  paystack_reference: string;
  paystack_event_type: string | null;
  amount_minor: number;
  currency: string;
  status: PaymentStatus;
  raw_payload: Json | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  id: string;
  variant_id: string;
  order_id: string | null;
  delta: number;
  reason: InventoryReason;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

// ── Composite / view types ────────────────────────────────────────────────────

/** Product with its primary image and cheapest active variant price. */
export interface ProductCard {
  id: string;
  name: string;
  slug: string;
  brand: Pick<Brand, "id" | "name" | "slug"> | null;
  category: Pick<Category, "id" | "name" | "slug"> | null;
  primary_image: string | null;
  min_price_minor: number;
  max_price_minor: number;
  in_stock: boolean;
}

/** Cart item enriched with variant and product data. */
export interface CartItemEnriched extends CartItem {
  variant: ProductVariant & {
    product: Pick<Product, "id" | "name" | "slug">;
    primary_image: string | null;
  };
}

export interface Database {
  public: {
    Tables: {
      users: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      user_roles: { Row: UserRole; Insert: Omit<UserRole, "id" | "created_at">; Update: Partial<UserRole> };
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      categories: { Row: Category; Insert: Partial<Category>; Update: Partial<Category> };
      brands: { Row: Brand; Insert: Partial<Brand>; Update: Partial<Brand> };
      products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product> };
      product_variants: { Row: ProductVariant; Insert: Partial<ProductVariant>; Update: Partial<ProductVariant> };
      product_images: { Row: ProductImage; Insert: Partial<ProductImage>; Update: Partial<ProductImage> };
      cart_items: { Row: CartItem; Insert: Partial<CartItem>; Update: Partial<CartItem> };
      user_addresses: { Row: Address; Insert: Partial<Address>; Update: Partial<Address> };
      coupons: { Row: Coupon; Insert: Partial<Coupon>; Update: Partial<Coupon> };
      orders: { Row: Order; Insert: Partial<Order>; Update: Partial<Order> };
      order_items: { Row: OrderItem; Insert: Partial<OrderItem>; Update: Partial<OrderItem> };
      payment_records: { Row: PaymentRecord; Insert: Partial<PaymentRecord>; Update: Partial<PaymentRecord> };
      inventory_movements: { Row: InventoryMovement; Insert: Partial<InventoryMovement>; Update: Partial<InventoryMovement> };
      reviews: { Row: Review; Insert: Partial<Review>; Update: Partial<Review> };
      wishlist_items: { Row: WishlistItem; Insert: Partial<WishlistItem>; Update: Partial<WishlistItem> };
      email_events: {
        Row: {
          id: string;
          recipient: string;
          template_key: string;
          status: string;
          provider_message_id: string | null;
          error_message: string | null;
          order_id: string | null;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          recipient: string;
          template_key: string;
          status: string;
          provider_message_id?: string | null;
          error_message?: string | null;
          order_id?: string | null;
          user_id?: string | null;
        };
        Update: Partial<{
          recipient: string;
          template_key: string;
          status: string;
          provider_message_id: string | null;
          error_message: string | null;
          order_id: string | null;
          user_id: string | null;
        }>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      discount_type: DiscountType;
      inventory_reason: InventoryReason;
    };
  };
}
