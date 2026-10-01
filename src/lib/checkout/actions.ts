"use server";

import { createClient } from "@/lib/supabase/server";
import { initializePaystackTransaction } from "@/lib/paystack/client";
import { calculateCouponDiscount } from "@/lib/coupon";
import { FIXTURE_PRODUCTS } from "@/lib/catalog/fixtures";
import type { Address, Coupon } from "@/lib/types/database";
import type {
  ShippingAddressSnapshot,
  CreateOrderParams,
  CheckoutInitResult,
} from "./types";

interface DbVariantQueryResult {
  id: string;
  sku: string;
  price_minor: number;
  stock: number;
  is_active: boolean;
  options: Record<string, string>;
  product: {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    images?: Array<{ storage_path: string; is_primary: boolean }>;
  } | null;
}

/**
 * Fetch saved addresses for the authenticated user
 */
export async function getUserAddressesAction(): Promise<Address[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Address[];
}

/**
 * Save a new delivery address
 */
export async function saveAddressAction(
  address: Omit<ShippingAddressSnapshot, "country"> & {
    label?: string;
    country?: string;
    is_default?: boolean;
  }
): Promise<{ success: boolean; address?: Address; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required" };
  }

  // If set to default, clear previous default
  if (address.is_default) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const { data, error } = await supabase
    .from("addresses")
    .insert({
      user_id: user.id,
      label: address.label || "Home",
      full_name: address.full_name,
      phone: address.phone,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || null,
      city: address.city,
      state: address.state,
      country: address.country || "NG",
      is_default: address.is_default ?? false,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, address: data as Address };
}

/**
 * Delete an address belonging to the authenticated user
 */
export async function deleteAddressAction(
  addressId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Set an address as default for the authenticated user
 */
export async function setDefaultAddressAction(
  addressId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  // Clear previous default
  await supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", user.id);

  // Set new default
  const { error } = await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Validates a coupon code against Supabase coupons & user redemptions
 */
export async function validateCouponAction(
  code: string,
  subtotalMinor: number
): Promise<{ valid: boolean; error?: string; discountMinor: number; code?: string }> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, error: "Please enter a coupon code", discountMinor: 0 };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: couponRecord, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", cleanCode)
    .maybeSingle();

  if (error || !couponRecord) {
    // Provide a demo fallback coupon for testing in dev if DB has not seeded coupons
    if (cleanCode === "WELCOME10") {
      const discount = Math.floor((subtotalMinor * 10) / 100);
      return { valid: true, discountMinor: discount, code: cleanCode };
    }
    return { valid: false, error: "Invalid coupon code", discountMinor: 0 };
  }

  const coupon = couponRecord as Coupon;

  // Check if user has already redeemed this coupon
  if (user) {
    const { data: existingUse } = await supabase
      .from("coupon_uses")
      .select("id")
      .eq("coupon_id", coupon.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingUse) {
      return {
        valid: false,
        error: "You have already used this coupon code",
        discountMinor: 0,
      };
    }
  }

  const result = calculateCouponDiscount(coupon, subtotalMinor);
  return {
    valid: result.valid,
    error: result.error,
    discountMinor: result.discountMinor,
    code: cleanCode,
  };
}

/**
 * Authoritative checkout order creator & Paystack initializer — AGENTS.md §15, §16
 */
export async function initializeCheckoutOrderAction(
  params: CreateOrderParams
): Promise<CheckoutInitResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Authentication required to checkout",
      redirect: "/sign-in?next=/checkout",
    };
  }

  if (!params.items || params.items.length === 0) {
    return { success: false, error: "Your shopping cart is empty" };
  }

  // 1. Authoritative price & stock loading from database
  const requestedVariantIds = params.items.map((i) => i.variantId);

  const { data: dbVariants } = await supabase
    .from("product_variants")
    .select(`
      id,
      sku,
      price_minor,
      stock,
      is_active,
      options,
      product:products (
        id,
        name,
        slug,
        is_active,
        images:product_images (storage_path, is_primary)
      )
    `)
    .in("id", requestedVariantIds);

  const variantsList = (dbVariants as unknown as DbVariantQueryResult[]) || [];

  // Prepared order line item snapshots
  interface PreparedLineItem {
    variantId: string | null;
    productName: string;
    variantSku: string;
    variantOptions: Record<string, string>;
    unitPriceMinor: number;
    quantity: number;
    lineTotalMinor: number;
    imageUrl: string | null;
  }

  const preparedItems: PreparedLineItem[] = [];
  let calculatedSubtotalMinor = 0;

  for (const item of params.items) {
    if (item.quantity <= 0) {
      return { success: false, error: "Item quantity must be greater than zero" };
    }

    const foundVariant = variantsList.find((v) => v.id === item.variantId);
    let productName = foundVariant?.product?.name;
    let variantSku = foundVariant?.sku;
    let variantOptions = foundVariant?.options || {};
    let unitPriceMinor = foundVariant?.price_minor;
    let stock = foundVariant?.stock ?? 0;
    let imageUrl =
      foundVariant?.product?.images?.find((img) => img.is_primary)?.storage_path ||
      foundVariant?.product?.images?.[0]?.storage_path ||
      null;

    // Fallback lookup in FIXTURE_PRODUCTS if not found in database (seed sync)
    if (!foundVariant) {
      for (const p of FIXTURE_PRODUCTS) {
        const v = p.variants.find((v) => v.id === item.variantId);
        if (v) {
          productName = p.name;
          variantSku = v.sku;
          variantOptions = v.options;
          unitPriceMinor = v.price_minor;
          stock = v.stock;
          imageUrl = p.primaryImage || null;
          break;
        }
      }
    }

    if (!unitPriceMinor || !productName) {
      return {
        success: false,
        error: `One of the selected items is no longer available in the catalog.`,
      };
    }

    if (item.quantity > stock) {
      return {
        success: false,
        error: `Insufficient stock for ${productName}. Only ${stock} available.`,
      };
    }

    const lineTotal = unitPriceMinor * item.quantity;
    calculatedSubtotalMinor += lineTotal;

    preparedItems.push({
      variantId: foundVariant ? foundVariant.id : null,
      productName,
      variantSku: variantSku || "SKU-GEN",
      variantOptions,
      unitPriceMinor,
      quantity: item.quantity,
      lineTotalMinor: lineTotal,
      imageUrl,
    });
  }

  // 2. Coupon discount verification
  let calculatedDiscountMinor = 0;
  if (params.couponCode) {
    const couponValidation = await validateCouponAction(
      params.couponCode,
      calculatedSubtotalMinor
    );
    if (couponValidation.valid) {
      calculatedDiscountMinor = couponValidation.discountMinor;
    }
  }

  // 3. Shipping threshold calculation (Free shipping at ₦1,000,000 / 100,000,000 kobo)
  const FREE_SHIPPING_THRESHOLD_MINOR = 100000000;
  const STANDARD_SHIPPING_MINOR = 350000; // ₦3,500
  const shippingMinor =
    calculatedSubtotalMinor >= FREE_SHIPPING_THRESHOLD_MINOR
      ? 0
      : STANDARD_SHIPPING_MINOR;

  const totalMinor = Math.max(
    0,
    calculatedSubtotalMinor - calculatedDiscountMinor + shippingMinor
  );

  // 4. Unique Paystack reference
  const reference = `splug_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // 5. Create pending order in Supabase
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending",
      payment_status: "pending",
      shipping_name: params.shippingAddress.full_name,
      shipping_phone: params.shippingAddress.phone,
      shipping_address1: params.shippingAddress.address_line1,
      shipping_address2: params.shippingAddress.address_line2 || null,
      shipping_city: params.shippingAddress.city,
      shipping_state: params.shippingAddress.state,
      shipping_country: params.shippingAddress.country || "NG",
      subtotal_minor: calculatedSubtotalMinor,
      shipping_minor: shippingMinor,
      discount_minor: calculatedDiscountMinor,
      total_minor: totalMinor,
      coupon_code: params.couponCode || null,
      coupon_discount_minor: calculatedDiscountMinor,
      payment_reference: reference,
      customer_note: params.customerNote || null,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("Order creation error:", orderError);
    return {
      success: false,
      error: "Unable to create order. Please try again.",
    };
  }

  // 6. Insert line items snapshot
  for (const item of preparedItems) {
    await supabase.from("order_items").insert({
      order_id: order.id,
      variant_id: item.variantId,
      product_name: item.productName,
      variant_sku: item.variantSku,
      variant_options: item.variantOptions,
      unit_price_minor: item.unitPriceMinor,
      quantity: item.quantity,
      line_total_minor: item.lineTotalMinor,
      image_url: item.imageUrl,
    });
  }

  // 7. Initialize Paystack transaction (server-side only)
  try {
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const callbackUrl = `${appUrl}/api/payments/paystack/verify`;

    const paystackRes = await initializePaystackTransaction({
      email: user.email!,
      amountMinor: totalMinor,
      reference,
      callbackUrl,
      metadata: {
        order_id: order.id,
        user_id: user.id,
        customer_name: params.shippingAddress.full_name,
      },
    });

    // Mark order status as payment_init
    await supabase
      .from("orders")
      .update({ status: "payment_init" })
      .eq("id", order.id);

    return {
      success: true,
      authorizationUrl: paystackRes.data.authorization_url,
      reference,
      orderId: order.id,
    };
  } catch (paystackError) {
    console.error("Paystack transaction initialization failed:", paystackError);
    return {
      success: false,
      error: "Payment processor initialization failed. Please retry.",
    };
  }
}
