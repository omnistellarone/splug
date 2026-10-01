"use server";

import { createClient } from "@/lib/supabase/server";
import { mergeCarts } from "./merge";
import type { CartItem } from "./types";

interface DbCartItemRecord {
  id: string;
  variant_id: string;
  quantity: number;
  variant: {
    id: string;
    product_id: string;
    sku: string;
    price_minor: number;
    options: Record<string, string>;
    stock: number;
    is_active: boolean;
    product: {
      name: string;
      images: Array<{ storage_path: string; is_primary: boolean }>;
    };
  };
}

/**
 * Fetch authoritative user cart from Supabase
 */
export async function getDatabaseCartAction(): Promise<CartItem[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

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
    .eq("user_id", user.id);

  if (error || !data) return [];

  const validItems: CartItem[] = [];

  for (const raw of data as unknown as DbCartItemRecord[]) {
    if (!raw.variant || !raw.variant.is_active) continue;

    const img =
      raw.variant.product?.images?.find((i) => i.is_primary)?.storage_path ||
      raw.variant.product?.images?.[0]?.storage_path;

    validItems.push({
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

  return validItems;
}

/**
 * Merge local guest cart into database cart upon sign in
 */
export async function mergeCartOnLoginAction(
  localItems: CartItem[]
): Promise<CartItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return localItems;

  const dbItems = (await getDatabaseCartAction()) || [];
  const merged = mergeCarts(dbItems, localItems);

  // Write merged results to Supabase cart_items
  for (const item of merged) {
    await supabase.from("cart_items").upsert(
      {
        user_id: user.id,
        variant_id: item.variantId,
        quantity: item.quantity,
      },
      { onConflict: "user_id,variant_id" }
    );
  }

  return merged;
}

/**
 * Update single item quantity in database
 */
export async function syncItemToDatabaseAction(
  variantId: string,
  quantity: number
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  if (quantity <= 0) {
    await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id)
      .eq("variant_id", variantId);
  } else {
    await supabase.from("cart_items").upsert(
      {
        user_id: user.id,
        variant_id: variantId,
        quantity,
      },
      { onConflict: "user_id,variant_id" }
    );
  }
}
