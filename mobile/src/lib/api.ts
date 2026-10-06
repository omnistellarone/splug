import { supabase } from "./supabase";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const API_STORAGE_KEY = "slurge_api_base_url";

// Default base URL: Cloud Next.js production backend
const DEFAULT_API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://splug-teal.vercel.app";

let currentBaseUrl = DEFAULT_API_URL;

// Initialize custom URL from storage if saved
(async () => {
  try {
    const saved = await SecureStore.getItemAsync(API_STORAGE_KEY);
    if (saved && saved.startsWith("http")) {
      // Discard stale emulator/localhost loopback entries from old builds
      if (saved.includes("10.0.2.2") || saved.includes("localhost:3000")) {
        currentBaseUrl = DEFAULT_API_URL;
        await SecureStore.setItemAsync(API_STORAGE_KEY, DEFAULT_API_URL);
      } else {
        currentBaseUrl = saved;
      }
    }
  } catch {
    // Ignore
  }
})();

export function getApiBaseUrl(): string {
  return currentBaseUrl;
}

export async function setApiBaseUrl(newUrl: string): Promise<void> {
  const clean = newUrl.trim().replace(/\/$/, "");
  currentBaseUrl = clean;
  try {
    await SecureStore.setItemAsync(API_STORAGE_KEY, clean);
  } catch {
    // Ignore
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const fullUrl = `${currentBaseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const response = await fetch(fullUrl, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        error: json?.error || `Request failed with status ${response.status}`,
      };
    }

    return json;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error";
    if (msg.includes("aborted")) {
      return { success: false, error: "Connection timed out. Please check your network or server URL." };
    }
    return { success: false, error: msg };
  }
}

// ── Types ──────────────────────────────────────────────────────────────────
export interface ProductVariant {
  id: string;
  sku: string;
  price_minor: number;
  compare_at_price_minor?: number | null;
  stock: number;
  is_active: boolean;
  options: Record<string, string>;
}

export interface ProductImage {
  id?: string;
  storage_path: string;
  is_primary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category_id?: string;
  is_featured?: boolean;
  min_price_minor?: number;
  max_price_minor?: number;
  primary_image?: string;
  images?: ProductImage[];
  variants: ProductVariant[];
  related?: Product[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface CartItem {
  variantId: string;
  productId: string;
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

export interface Address {
  id: string;
  user_id: string;
  label?: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export interface OrderItem {
  id: string;
  variant_id?: string;
  product_name: string;
  variant_sku: string;
  variant_options?: Record<string, string>;
  unit_price_minor: number;
  quantity: number;
  line_total_minor: number;
  image_url?: string;
}

export interface OrderStatusHistoryItem {
  id: string;
  from_status?: string;
  to_status: string;
  note?: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: "pending" | "payment_init" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  payment_status: "pending" | "initiated" | "paid" | "failed" | "refunded";
  shipping_name?: string;
  shipping_full_name?: string;
  shipping_phone: string;
  shipping_address1?: string;
  shipping_address_line1?: string;
  shipping_city: string;
  shipping_state: string;
  subtotal_minor: number;
  shipping_minor: number;
  discount_minor: number;
  total_minor: number;
  coupon_code?: string;
  payment_reference?: string;
  created_at: string;
  order_items: OrderItem[];
  order_status_history?: OrderStatusHistoryItem[];
}

// ── API Methods ────────────────────────────────────────────────────────────
export const api = {
  // Catalog
  async getProducts(params: {
    category?: string;
    query?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const qs = new URLSearchParams();
    if (params.category) qs.set("category", params.category);
    if (params.query) qs.set("q", params.query);
    if (params.page) qs.set("page", params.page.toString());
    if (params.limit) qs.set("limit", params.limit.toString());

    const res = await request<Product[]>(`/api/products?${qs.toString()}`);
    if (res.success && res.data) {
      const normalized = (res.data as any[]).map((p: any) => ({
        ...p,
        primary_image: p.primary_image || p.primaryImage || p.images?.[0]?.storage_path,
        primaryImage: p.primaryImage || p.primary_image || p.images?.[0]?.storage_path,
        min_price_minor: p.min_price_minor || p.minPriceMinor || 0,
      }));
      return { success: true, data: normalized as Product[] };
    }

    // Direct Supabase fallback if Next.js local server is unreachable
    try {
      let q = supabase
        .from("products")
        .select(`
          id, name, slug, description, category_id, is_featured,
          images:product_images (storage_path, is_primary),
          variants:product_variants (id, sku, price_minor, compare_at_price_minor, stock, is_active, options)
        `)
        .eq("is_active", true);

      if (params.query) {
        q = q.ilike("name", `%${params.query}%`);
      }

      const { data, error } = await q;
      if (!error && data) {
        const mapped: Product[] = data.map((p: any) => {
          const variants = (p.variants || []).filter((v: any) => v.is_active);
          const prices = variants.map((v: any) => v.price_minor);
          const minPrice = prices.length ? Math.min(...prices) : 0;
          const maxPrice = prices.length ? Math.max(...prices) : 0;
          const primaryImg =
            p.images?.find((i: any) => i.is_primary)?.storage_path ||
            p.images?.[0]?.storage_path;

          return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: p.description,
            category_id: p.category_id,
            is_featured: p.is_featured,
            min_price_minor: minPrice,
            max_price_minor: maxPrice,
            primary_image: primaryImg,
            primaryImage: primaryImg,
            images: p.images || [],
            variants,
          };
        });
        return { success: true, data: mapped };
      }
    } catch {
      // Ignore
    }

    return res;
  },

  async getProductBySlug(slug: string) {
    const res = await request<Product>(`/api/products/${encodeURIComponent(slug)}`);
    if (res.success && res.data) {
      const p = res.data as any;
      const normalized: Product = {
        ...p,
        primary_image: p.primary_image || p.primaryImage || p.images?.[0]?.storage_path,
        primaryImage: p.primaryImage || p.primary_image || p.images?.[0]?.storage_path,
        min_price_minor: p.min_price_minor || p.minPriceMinor || 0,
      };
      return { success: true, data: normalized };
    }

    // Direct Supabase fallback
    try {
      const { data: p, error } = await supabase
        .from("products")
        .select(`
          id, name, slug, description, category_id, is_featured,
          images:product_images (storage_path, is_primary),
          variants:product_variants (id, sku, price_minor, compare_at_price_minor, stock, is_active, options)
        `)
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (!error && p) {
        const variants = (p.variants || []).filter((v: any) => v.is_active);
        const prices = variants.map((v: any) => v.price_minor);
        const minPrice = prices.length ? Math.min(...prices) : 0;
        const maxPrice = prices.length ? Math.max(...prices) : 0;
        const primaryImg =
          p.images?.find((i: any) => i.is_primary)?.storage_path ||
          p.images?.[0]?.storage_path;

        return {
          success: true,
          data: {
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: p.description,
            category_id: p.category_id,
            is_featured: p.is_featured,
            min_price_minor: minPrice,
            max_price_minor: maxPrice,
            primary_image: primaryImg,
            images: p.images || [],
            variants,
          },
        };
      }
    } catch {
      // Ignore
    }

    return res;
  },

  async getCategories() {
    const res = await request<Category[]>("/api/categories");
    if (res.success && res.data) return res;

    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, description")
        .eq("is_active", true);

      if (!error && data) {
        return { success: true, data: data as Category[] };
      }
    } catch {
      // Ignore
    }

    return res;
  },

  // Cart
  async getCart() {
    const res = await request<{ items: CartItem[]; totals: CartTotals }>("/api/cart");
    if (res.success && res.data) return res;

    // Direct Supabase fallback
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) return res;

      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          variant_id,
          quantity,
          variant:product_variants (
            id,
            product_id,
            sku,
            price_minor,
            options,
            stock,
            is_active,
            product:products (
              name,
              images:product_images (storage_path, is_primary)
            )
          )
        `)
        .eq("user_id", userId);

      if (!error && data) {
        const items: CartItem[] = [];
        for (const raw of data as any[]) {
          if (!raw.variant || !raw.variant.is_active) continue;
          const img =
            raw.variant.product?.images?.find((i: any) => i.is_primary)?.storage_path ||
            raw.variant.product?.images?.[0]?.storage_path;
          items.push({
            variantId: raw.variant.id,
            productId: raw.variant.product_id,
            productName: raw.variant.product?.name || "Product",
            variantSku: raw.variant.sku,
            variantOptions: raw.variant.options || {},
            priceMinor: raw.variant.price_minor,
            image: img,
            quantity: Math.min(raw.quantity, raw.variant.stock),
            maxStock: raw.variant.stock,
          });
        }
        const subtotalMinor = items.reduce((sum, i) => sum + i.priceMinor * i.quantity, 0);
        const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
        return {
          success: true,
          data: {
            items,
            totals: {
              subtotalMinor,
              itemCount,
              freeShippingThresholdMinor: 100000000,
              amountNeededForFreeShippingMinor: Math.max(0, 100000000 - subtotalMinor),
              qualifiesForFreeShipping: subtotalMinor >= 100000000,
            },
          },
        };
      }
    } catch {
      // Ignore
    }

    return res;
  },

  async updateCartItem(variantId: string, quantity: number) {
    const res = await request<{ items: CartItem[]; totals: CartTotals }>("/api/cart", {
      method: "POST",
      body: JSON.stringify({ variantId, quantity }),
    });
    if (res.success && res.data) return res;

    // Direct Supabase fallback
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (userId) {
        if (quantity <= 0) {
          await supabase.from("cart_items").delete().eq("user_id", userId).eq("variant_id", variantId);
        } else {
          await supabase.from("cart_items").upsert(
            {
              user_id: userId,
              variant_id: variantId,
              quantity,
            },
            { onConflict: "user_id,variant_id" }
          );
        }
        return await this.getCart();
      }
    } catch {
      // Ignore
    }

    return res;
  },

  async removeCartItem(variantId: string) {
    const res = await request<{ items: CartItem[]; totals: CartTotals }>(
      `/api/cart?variantId=${encodeURIComponent(variantId)}`,
      { method: "DELETE" }
    );
    if (res.success && res.data) return res;

    // Direct Supabase fallback
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (userId) {
        await supabase.from("cart_items").delete().eq("user_id", userId).eq("variant_id", variantId);
        return await this.getCart();
      }
    } catch {
      // Ignore
    }

    return res;
  },

  async clearCart() {
    const res = await request<{ items: CartItem[]; totals: CartTotals }>(
      "/api/cart?clearAll=true",
      { method: "DELETE" }
    );
    if (res.success && res.data) return res;

    // Direct Supabase fallback
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (userId) {
        await supabase.from("cart_items").delete().eq("user_id", userId);
        return {
          success: true,
          data: {
            items: [],
            totals: {
              subtotalMinor: 0,
              itemCount: 0,
              freeShippingThresholdMinor: 100000000,
              amountNeededForFreeShippingMinor: 100000000,
              qualifiesForFreeShipping: false,
            },
          },
        };
      }
    } catch {
      // Ignore
    }

    return res;
  },

  async mergeCart(localItems: CartItem[]) {
    const res = await request<{ items: CartItem[]; totals: CartTotals }>("/api/cart/merge", {
      method: "POST",
      body: JSON.stringify({ localItems }),
    });
    if (res.success && res.data) return res;

    // Direct Supabase fallback
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (userId) {
        for (const item of localItems) {
          await supabase.from("cart_items").upsert(
            {
              user_id: userId,
              variant_id: item.variantId,
              quantity: item.quantity,
            },
            { onConflict: "user_id,variant_id" }
          );
        }
        return await this.getCart();
      }
    } catch {
      // Ignore
    }

    return res;
  },

  // Coupons
  async validateCoupon(code: string, subtotalMinor: number) {
    return request<{
      valid: boolean;
      discountMinor: number;
      code?: string;
      error?: string;
    }>("/api/coupons/validate", {
      method: "POST",
      body: JSON.stringify({ code, subtotalMinor }),
    });
  },

  // Addresses
  async getAddresses() {
    return request<Address[]>("/api/addresses");
  },

  async saveAddress(address: Partial<Address>) {
    return request<Address>("/api/addresses", {
      method: "POST",
      body: JSON.stringify(address),
    });
  },

  async setDefaultAddress(id: string) {
    return request<Address>("/api/addresses", {
      method: "PATCH",
      body: JSON.stringify({ id, is_default: true }),
    });
  },

  async deleteAddress(id: string) {
    return request<{ success: boolean }>(`/api/addresses?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  // Checkout & Paystack
  async initCheckout(params: {
    items: Array<{ variantId: string; quantity: number }>;
    shippingAddress: {
      full_name: string;
      phone: string;
      address_line1: string;
      address_line2?: string | null;
      city: string;
      state: string;
      country?: string;
    };
    couponCode?: string;
    customerNote?: string;
    callbackUrl?: string;
  }) {
    return request<{
      orderId: string;
      authorizationUrl: string;
      reference: string;
    }>("/api/checkout", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  async verifyPayment(reference: string) {
    return request<{
      orderId: string;
      reference: string;
      status: string;
      amountMinor: number;
    }>(`/api/payments/paystack/verify?reference=${encodeURIComponent(reference)}&format=json`);
  },

  // Orders
  async getOrders() {
    return request<Order[]>("/api/orders");
  },

  async getOrderDetails(orderId: string) {
    return request<Order>(`/api/orders/${encodeURIComponent(orderId)}`);
  },

  // Store Settings
  async getStoreSettings() {
    return request<{ freeShippingThresholdMinor: number }>("/api/settings");
  },
};
