"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderStatusChanged } from "@/lib/email/service";
import type { OrderStatus, DiscountType } from "@/lib/types/database";
import type {
  AdminAnalyticsSummary,
  AdminProductItem,
  AdminOrderItem,
  AdminCouponItem,
  AdminReviewItem,
  AdminCustomerItem,
} from "./types";

interface DbVariantRow {
  id: string;
  sku: string;
  stock: number;
  price_minor: number;
  products: { id: string; name: string } | null;
}

interface DbOrderRow {
  id: string;
  created_at: string;
  shipping_name: string;
  shipping_city: string;
  shipping_state: string;
  total_minor: number;
  status: OrderStatus;
  payment_status: "pending" | "initiated" | "paid" | "failed" | "refunded";
  order_items?: { id: string }[];
}

interface DbProductRow {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  categories: { name: string } | null;
  brands: { name: string } | null;
  product_variants: {
    id: string;
    sku?: string;
    price_minor: number;
    stock: number;
  }[];
}

interface DbReviewRow {
  id: string;
  product_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified: boolean;
  is_approved: boolean;
  created_at: string;
  products: { name: string } | null;
  profiles: { display_name: string | null } | null;
}

/**
 * Fetch high-level analytics summary for the admin dashboard
 */
export async function getAdminAnalyticsAction(): Promise<AdminAnalyticsSummary> {
  await requireAdminSession();
  const supabase = createAdminClient();

  const [ordersRes, customersRes, lowStockRes, recentOrdersRes] =
    await Promise.all([
      // Paid orders metrics
      supabase
        .from("orders")
        .select("total_minor")
        .eq("payment_status", "paid"),
      // Total customers count
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true }),
      // Low stock variants (stock <= 5)
      supabase
        .from("product_variants")
        .select(`
          id,
          sku,
          stock,
          price_minor,
          products (id, name)
        `)
        .lte("stock", 5)
        .order("stock", { ascending: true })
        .limit(10),
      // Recent 5 orders
      supabase
        .from("orders")
        .select(`
          id,
          created_at,
          shipping_name,
          total_minor,
          status,
          payment_status
        `)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const paidOrders = ordersRes.data || [];
  const totalRevenueMinor = paidOrders.reduce(
    (sum, o) => sum + (o.total_minor || 0),
    0
  );
  const totalPaidOrders = paidOrders.length;
  const averageOrderValueMinor =
    totalPaidOrders > 0
      ? Math.round(totalRevenueMinor / totalPaidOrders)
      : 0;

  const totalCustomers = customersRes.count || 0;

  const rawLowStock = (lowStockRes.data || []) as unknown as DbVariantRow[];
  const lowStockVariants = rawLowStock.map((v) => ({
    variantId: v.id,
    productId: v.products?.id || "",
    productName: v.products?.name || "Unknown Product",
    sku: v.sku,
    stock: v.stock,
    priceMinor: v.price_minor,
  }));

  const rawRecent = (recentOrdersRes.data || []) as unknown as Array<{
    id: string;
    created_at: string;
    shipping_name: string;
    total_minor: number;
    status: OrderStatus;
    payment_status: "pending" | "initiated" | "paid" | "failed" | "refunded";
  }>;

  const recentOrders = rawRecent.map((o) => ({
    id: o.id,
    createdAt: o.created_at,
    customerName: o.shipping_name,
    totalMinor: o.total_minor,
    status: o.status,
    paymentStatus: o.payment_status,
  }));

  return {
    totalRevenueMinor,
    totalPaidOrders,
    totalCustomers,
    averageOrderValueMinor,
    lowStockCount: lowStockVariants.length,
    recentOrders,
    lowStockVariants,
  };
}

/**
 * Fetch all products with catalog info and total inventory
 */
export async function getAdminProductsAction(): Promise<AdminProductItem[]> {
  try {
    await requireAdminSession();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        is_active,
        categories (name),
        brands (name),
        product_variants (
          id,
          sku,
          price_minor,
          stock
        ),
        product_images (
          storage_path,
          is_primary
        )
      `)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getAdminProductsAction query error:", error);
      return [];
    }
    if (!data) return [];

    const rawList = data as unknown as (DbProductRow & {
      product_images?: Array<{ storage_path: string; is_primary: boolean }>;
    })[];

    return rawList.map((p) => {
      const variants = p.product_variants || [];
      const totalStock = variants.reduce((acc, v) => acc + (v.stock || 0), 0);
      const basePriceMinor =
        variants.length > 0
          ? Math.min(...variants.map((v) => v.price_minor))
          : 0;
      const images = p.product_images || [];
      const primaryImg =
        images.find((i) => i.is_primary)?.storage_path ||
        images[0]?.storage_path ||
        null;
      const firstSku = variants[0]?.sku;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        categoryName: p.categories?.name || "General",
        brandName: p.brands?.name || "Generic",
        isActive: p.is_active,
        basePriceMinor,
        totalStock,
        variantCount: variants.length,
        imageUrl: primaryImg,
        sku: firstSku,
      };
    });
  } catch (err) {
    console.error("getAdminProductsAction error:", err);
    return [];
  }
}

/**
 * Update stock level for a product variant and record an inventory movement
 */
export async function updateVariantStockAction(
  variantId: string,
  newStock: number
): Promise<{ success: boolean; error?: string }> {
  const session = await requireAdminSession();
  const supabase = createAdminClient();

  if (newStock < 0) {
    return { success: false, error: "Stock cannot be negative." };
  }

  // Fetch current stock to calculate delta
  const { data: currentVariant, error: fetchErr } = await supabase
    .from("product_variants")
    .select("stock")
    .eq("id", variantId)
    .single();

  if (fetchErr || !currentVariant) {
    return { success: false, error: "Variant not found." };
  }

  const delta = newStock - currentVariant.stock;

  // Update variant stock
  const { error: updateErr } = await supabase
    .from("product_variants")
    .update({ stock: newStock, updated_at: new Date().toISOString() })
    .eq("id", variantId);

  if (updateErr) {
    return { success: false, error: updateErr.message };
  }

  // Record inventory movement audit
  if (delta !== 0) {
    await supabase.from("inventory_movements").insert({
      variant_id: variantId,
      delta,
      reason: "adjustment",
      note: `Manual stock adjustment by admin (${delta > 0 ? "+" : ""}${delta})`,
      created_by: session.user?.id,
    });
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin");
  return { success: true };
}

/**
 * Fetch orders for admin list with optional status filtering
 */
export async function getAdminOrdersAction(
  statusFilter?: string
): Promise<AdminOrderItem[]> {
  await requireAdminSession();
  const supabase = createAdminClient();

  let query = supabase
    .from("orders")
    .select(`
      id,
      created_at,
      shipping_name,
      shipping_city,
      shipping_state,
      total_minor,
      status,
      payment_status,
      order_items (id)
    `)
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  const rawOrders = data as unknown as DbOrderRow[];

  return rawOrders.map((o) => ({
    id: o.id,
    createdAt: o.created_at,
    shippingName: o.shipping_name,
    shippingCity: o.shipping_city,
    shippingState: o.shipping_state,
    totalMinor: o.total_minor,
    status: o.status,
    paymentStatus: o.payment_status,
    itemsCount: o.order_items?.length || 0,
  }));
}

/**
 * Update order status and trigger customer notification email via Mailgun
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  await requireAdminSession();
  const supabase = createAdminClient();

  // Fetch order to get user info for notification
  const { data: rawOrder, error: orderErr } = await supabase
    .from("orders")
    .select(`
      id,
      status,
      shipping_name,
      shipping_address1,
      shipping_address2,
      shipping_city,
      shipping_state,
      shipping_phone,
      total_minor,
      subtotal_minor,
      shipping_minor,
      discount_minor,
      payment_reference,
      user_id
    `)
    .eq("id", orderId)
    .single();

  if (orderErr || !rawOrder) {
    return { success: false, error: "Order not found." };
  }

  const order = rawOrder as {
    id: string;
    status: OrderStatus;
    shipping_name: string;
    shipping_address1: string;
    shipping_address2?: string | null;
    shipping_city: string;
    shipping_state: string;
    shipping_phone: string;
    total_minor: number;
    subtotal_minor: number;
    shipping_minor: number;
    discount_minor: number;
    payment_reference: string | null;
    user_id: string;
  };

  // Update order status
  const { error: updateErr } = await supabase
    .from("orders")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (updateErr) {
    return { success: false, error: updateErr.message };
  }

  // Retrieve user email from auth.users using admin client
  try {
    const { data: userData } = await supabase.auth.admin.getUserById(
      order.user_id
    );
    const userEmail = userData.user?.email;

    if (userEmail) {
      await sendOrderStatusChanged(
        {
          orderId: order.id,
          orderNumber: order.id.slice(0, 8),
          customerName: order.shipping_name,
          customerEmail: userEmail,
          paymentReference: order.payment_reference || "",
          items: [],
          subtotalMinor: order.subtotal_minor || 0,
          shippingMinor: order.shipping_minor || 0,
          discountMinor: order.discount_minor || 0,
          totalMinor: order.total_minor || 0,
          shippingAddress: {
            full_name: order.shipping_name,
            address_line1: order.shipping_address1,
            address_line2: order.shipping_address2 || undefined,
            city: order.shipping_city,
            state: order.shipping_state,
            phone: order.shipping_phone,
          },
          status: newStatus,
        },
        newStatus as
          | "processing"
          | "shipped"
          | "delivered"
          | "cancelled"
          | "refunded"
      );
    }
  } catch (emailErr) {
    // Email failure must not revert order status update per AGENTS.md §17
    console.error("Failed to send status update email:", emailErr);
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { success: true };
}

/**
 * Fetch all promotional coupons for admin management
 */
export async function getAdminCouponsAction(): Promise<AdminCouponItem[]> {
  await requireAdminSession();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((c) => ({
    id: c.id,
    code: c.code,
    description: c.description,
    discountType: c.discount_type as DiscountType,
    discountValue: c.discount_value,
    minOrderMinor: c.min_order_minor,
    maxUses: c.max_uses,
    usedCount: c.used_count,
    isActive: c.is_active,
    expiresAt: c.expires_at,
  }));
}

/**
 * Toggle coupon active state
 */
export async function toggleCouponActiveAction(
  couponId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  await requireAdminSession();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("coupons")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", couponId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/coupons");
  return { success: true };
}

/**
 * Create a new promotional discount coupon
 */
export async function createCouponAction(formData: FormData): Promise<{
  success: boolean;
  error?: string;
}> {
  await requireAdminSession();
  const supabase = createAdminClient();

  const code = (formData.get("code") as string)?.trim().toUpperCase();
  const description = (formData.get("description") as string)?.trim();
  const discountType = formData.get("discountType") as DiscountType;
  const rawDiscountValue = Number(formData.get("discountValue"));
  const rawMinOrderNaira = Number(formData.get("minOrderNaira") || 0);

  if (!code) {
    return { success: false, error: "Coupon code is required." };
  }

  if (isNaN(rawDiscountValue) || rawDiscountValue <= 0) {
    return { success: false, error: "Please enter a valid discount value." };
  }

  // If percentage: value is percentage (e.g. 10 for 10%)
  // If fixed: convert Naira input to kobo minor units
  const discountValue =
    discountType === "percentage"
      ? Math.min(100, Math.round(rawDiscountValue))
      : Math.round(rawDiscountValue * 100);

  const minOrderMinor = Math.max(0, Math.round(rawMinOrderNaira * 100));

  const { error } = await supabase.from("coupons").insert({
    code,
    description: description || null,
    discount_type: discountType,
    discount_value: discountValue,
    min_order_minor: minOrderMinor,
    is_active: true,
  });

  if (error) {
    if (error.message.includes("unique")) {
      return { success: false, error: "Coupon code already exists." };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/coupons");
  return { success: true };
}

/**
 * Fetch reviews for admin moderation
 */
export async function getAdminReviewsAction(): Promise<AdminReviewItem[]> {
  await requireAdminSession();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(`
      id,
      product_id,
      rating,
      title,
      body,
      is_verified,
      is_approved,
      created_at,
      products (name),
      profiles (display_name)
    `)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const rawReviews = data as unknown as DbReviewRow[];

  return rawReviews.map((r) => ({
    id: r.id,
    productId: r.product_id,
    productName: r.products?.name || "Product",
    authorName: r.profiles?.display_name || "Customer",
    rating: r.rating,
    title: r.title,
    body: r.body,
    isVerified: r.is_verified,
    isApproved: r.is_approved,
    createdAt: r.created_at,
  }));
}

/**
 * Moderate a review (Approve or Reject/Unapprove)
 */
export async function moderateReviewAction(
  reviewId: string,
  isApproved: boolean
): Promise<{ success: boolean; error?: string }> {
  await requireAdminSession();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("reviews")
    .update({ is_approved: isApproved, updated_at: new Date().toISOString() })
    .eq("id", reviewId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/reviews");
  return { success: true };
}

/**
 * Fetch registered customers list with aggregated metrics
 */
export async function getAdminCustomersAction(): Promise<AdminCustomerItem[]> {
  await requireAdminSession();
  const supabase = createAdminClient();

  const [profilesRes, ordersRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, phone, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("user_id, total_minor, payment_status"),
  ]);

  if (!profilesRes.data) return [];

  const paidOrders = (ordersRes.data || []).filter(
    (o) => o.payment_status === "paid"
  );

  return profilesRes.data.map((p) => {
    const userOrders = paidOrders.filter((o) => o.user_id === p.id);
    const totalSpentMinor = userOrders.reduce(
      (sum, o) => sum + (o.total_minor || 0),
      0
    );

    return {
      id: p.id,
      displayName: p.display_name || "Customer",
      phone: p.phone,
      orderCount: userOrders.length,
      totalSpentMinor,
      createdAt: p.created_at,
    };
  });
}

/**
 * Create a new product with an initial variant
 */
export async function createProductAction(formData: FormData): Promise<{
  success: boolean;
  productId?: string;
  error?: string;
}> {
  try {
    const session = await requireAdminSession();
    const supabase = createAdminClient();

    const name = (formData.get("name") as string)?.trim();
    const customSlug = (formData.get("slug") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const rawCategoryId = (formData.get("categoryId") as string)?.trim() || null;
    const rawBrandId = (formData.get("brandId") as string)?.trim() || null;
    const rawPriceNaira = Number(formData.get("priceNaira"));
    const sku = (formData.get("sku") as string)?.trim().toUpperCase();
    const initialStock = Number(formData.get("stock") || 0);

    if (!name) return { success: false, error: "Product name is required." };
    if (!sku) return { success: false, error: "SKU is required." };
    if (isNaN(rawPriceNaira) || rawPriceNaira <= 0) {
      return { success: false, error: "Please enter a valid price." };
    }

    const slug =
      customSlug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const priceMinor = Math.round(rawPriceNaira * 100);

    // Safely resolve categoryId (ensure valid UUID format or lookup by slug)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let categoryId: string | null = null;
    if (rawCategoryId) {
      if (uuidRegex.test(rawCategoryId)) {
        categoryId = rawCategoryId;
      } else {
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .or(`slug.eq.${rawCategoryId},name.ilike.${rawCategoryId}`)
          .maybeSingle();
        categoryId = cat?.id || null;
      }
    }

    // Safely resolve brandId (ensure valid UUID format or lookup by slug)
    let brandId: string | null = null;
    if (rawBrandId) {
      if (uuidRegex.test(rawBrandId)) {
        brandId = rawBrandId;
      } else {
        const { data: br } = await supabase
          .from("brands")
          .select("id")
          .or(`slug.eq.${rawBrandId},name.ilike.${rawBrandId}`)
          .maybeSingle();
        brandId = br?.id || null;
      }
    }

    // 1. Insert product
    const { data: product, error: prodErr } = await supabase
      .from("products")
      .insert({
        name,
        slug,
        description: description || null,
        category_id: categoryId,
        brand_id: brandId,
        is_active: true,
        is_archived: false,
      })
      .select("id")
      .single();

    if (prodErr || !product) {
      console.error("createProduct prodErr:", prodErr);
      return {
        success: false,
        error: prodErr?.message || "Failed to create product in database.",
      };
    }

    // 2. Insert initial variant
    const { data: variant, error: varErr } = await supabase
      .from("product_variants")
      .insert({
        product_id: product.id,
        sku,
        price_minor: priceMinor,
        stock: initialStock,
        options: { Standard: "Default" },
        is_active: true,
      })
      .select("id")
      .single();

    if (varErr || !variant) {
      console.error("createProduct varErr:", varErr);
      return {
        success: false,
        error: varErr?.message || "Failed to create product variant.",
      };
    }

    // 3. Handle image upload or image URL
    const imageFile = formData.get("imageFile") as File | null;
    const directImageUrl = (formData.get("imageUrl") as string)?.trim() || null;
    let finalImageUrl: string | null = directImageUrl;

    if (imageFile && imageFile.size > 0 && typeof imageFile.arrayBuffer === "function") {
      try {
        const fileExt = imageFile.name.split(".").pop() || "jpg";
        const sanitizedPath = `products/${product.id}-${Date.now()}.${fileExt}`;
        const buffer = Buffer.from(await imageFile.arrayBuffer());

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("product-images")
          .upload(sanitizedPath, buffer, {
            contentType: imageFile.type || "image/jpeg",
            upsert: true,
          });

        if (!uploadErr && uploadData?.path) {
          const { data: publicUrlData } = supabase.storage
            .from("product-images")
            .getPublicUrl(uploadData.path);
          finalImageUrl = publicUrlData.publicUrl;
        } else if (uploadErr) {
          console.warn("Storage upload warning:", uploadErr);
        }
      } catch (uploadException) {
        console.warn("Storage upload exception:", uploadException);
      }
    }

    // If an image was provided or uploaded, link it to product_images
    if (finalImageUrl) {
      const { error: imgErr } = await supabase.from("product_images").insert({
        product_id: product.id,
        storage_path: finalImageUrl,
        alt_text: name,
        is_primary: true,
        sort_order: 1,
      });
      if (imgErr) {
        console.warn("product_images insert warning:", imgErr);
      }
    }

    // 4. Record initial inventory movement if stock > 0
    if (initialStock > 0) {
      await supabase.from("inventory_movements").insert({
        variant_id: variant.id,
        delta: initialStock,
        reason: "restock",
        note: "Initial product stock on creation",
        created_by: session.user?.id,
      });
    }

    revalidatePath("/admin/products");
    revalidatePath("/admin");
    revalidatePath("/shop");
    revalidatePath("/");
    revalidatePath(`/product/${slug}`);

    return { success: true, productId: product.id };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected server error occurred.";
    console.error("createProductAction error:", err);
    return { success: false, error: message };
  }
}

/**
 * Toggle product active status
 */
export async function toggleProductActiveAction(
  productId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  await requireAdminSession();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", productId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true };
}

/**
 * Delete or safely archive a product
 */
export async function deleteProductAction(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdminSession();
    const supabase = createAdminClient();

    // 1. Check if any order items reference this product's variants
    const { data: variants } = await supabase
      .from("product_variants")
      .select("id")
      .eq("product_id", productId);

    const variantIds = (variants || []).map((v) => v.id);

    let hasOrders = false;
    if (variantIds.length > 0) {
      const { count } = await supabase
        .from("order_items")
        .select("id", { count: "exact", head: true })
        .in("variant_id", variantIds);

      hasOrders = !!(count && count > 0);
    }

    if (hasOrders) {
      // Soft-delete / Archive: keep database referential integrity for customer orders (AGENTS.md §10)
      const { error: archErr } = await supabase
        .from("products")
        .update({
          is_archived: true,
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId);

      if (archErr) return { success: false, error: archErr.message };
    } else {
      // No order references: safe to delete directly (cascades to variants & images)
      const { error: delErr } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (delErr) return { success: false, error: delErr.message };
    }

    revalidatePath("/admin/products");
    revalidatePath("/admin");
    revalidatePath("/shop");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete product.";
    return { success: false, error: msg };
  }
}

/**
 * Fetch a single product with full details for editing
 */
export async function getProductForEditAction(productId: string) {
  try {
    await requireAdminSession();
    const supabase = createAdminClient();

    const { data: product, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(*),
        brand:brands(*),
        variants:product_variants(*),
        images:product_images(*)
      `)
      .eq("id", productId)
      .single();

    if (error || !product) return null;
    return product;
  } catch (err) {
    console.error("getProductForEditAction error:", err);
    return null;
  }
}

/**
 * Update an existing product, variant, and primary image
 */
export async function updateProductAction(
  productId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireAdminSession();
    const supabase = createAdminClient();

    const name = (formData.get("name") as string)?.trim();
    const slug = (formData.get("slug") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const rawCategoryId = (formData.get("categoryId") as string)?.trim() || null;
    const rawBrandId = (formData.get("brandId") as string)?.trim() || null;
    const rawPriceNaira = Number(formData.get("priceNaira"));
    const sku = (formData.get("sku") as string)?.trim().toUpperCase();
    const stock = Number(formData.get("stock") || 0);

    if (!name) return { success: false, error: "Product name is required." };
    if (!sku) return { success: false, error: "SKU is required." };
    if (isNaN(rawPriceNaira) || rawPriceNaira <= 0) {
      return { success: false, error: "Please enter a valid price." };
    }

    const priceMinor = Math.round(rawPriceNaira * 100);

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let categoryId: string | null = null;
    if (rawCategoryId && uuidRegex.test(rawCategoryId)) {
      categoryId = rawCategoryId;
    }
    let brandId: string | null = null;
    if (rawBrandId && uuidRegex.test(rawBrandId)) {
      brandId = rawBrandId;
    }

    // 1. Update product info
    const { error: prodErr } = await supabase
      .from("products")
      .update({
        name,
        slug,
        description: description || null,
        category_id: categoryId,
        brand_id: brandId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);

    if (prodErr) return { success: false, error: prodErr.message };

    // 2. Update variants or insert if none exists
    const { data: variants } = await supabase
      .from("product_variants")
      .select("id, stock, price_minor")
      .eq("product_id", productId);

    if (variants && variants.length > 0) {
      // Update all variants with the new price and stock
      for (const v of variants) {
        await supabase
          .from("product_variants")
          .update({
            price_minor: priceMinor,
            stock,
            updated_at: new Date().toISOString(),
          })
          .eq("id", v.id);
      }

      // Also set SKU on the primary/first variant
      await supabase
        .from("product_variants")
        .update({ sku })
        .eq("id", variants[0].id);

      const oldStock = variants[0].stock;
      if (stock !== oldStock) {
        await supabase.from("inventory_movements").insert({
          variant_id: variants[0].id,
          delta: stock - oldStock,
          reason: "adjustment",
          note: "Stock adjustment via admin edit",
          created_by: session.user?.id,
        });
      }
    } else {
      await supabase.from("product_variants").insert({
        product_id: productId,
        sku,
        price_minor: priceMinor,
        stock,
        options: { Standard: "Default" },
        is_active: true,
      });
    }

    // 3. Handle image upload or image URL
    const imageFile = formData.get("imageFile") as File | null;
    const directImageUrl = (formData.get("imageUrl") as string)?.trim() || null;
    let finalImageUrl: string | null = directImageUrl;

    if (imageFile && imageFile.size > 0 && typeof imageFile.arrayBuffer === "function") {
      try {
        const fileExt = imageFile.name.split(".").pop() || "jpg";
        const sanitizedPath = `products/${productId}-${Date.now()}.${fileExt}`;
        const buffer = Buffer.from(await imageFile.arrayBuffer());

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("product-images")
          .upload(sanitizedPath, buffer, {
            contentType: imageFile.type || "image/jpeg",
            upsert: true,
          });

        if (!uploadErr && uploadData?.path) {
          const { data: publicUrlData } = supabase.storage
            .from("product-images")
            .getPublicUrl(uploadData.path);
          finalImageUrl = publicUrlData.publicUrl;
        }
      } catch (uploadException) {
        console.warn("Storage upload exception:", uploadException);
      }
    }

    if (finalImageUrl) {
      // Set existing images is_primary = false, then upsert new primary image
      await supabase
        .from("product_images")
        .update({ is_primary: false })
        .eq("product_id", productId);

      await supabase.from("product_images").insert({
        product_id: productId,
        storage_path: finalImageUrl,
        alt_text: name,
        is_primary: true,
        sort_order: 1,
      });
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/products");
    revalidatePath("/admin");
    revalidatePath("/shop");
    revalidatePath("/");
    revalidatePath(`/product/${slug}`);

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update product.";
    return { success: false, error: msg };
  }
}
