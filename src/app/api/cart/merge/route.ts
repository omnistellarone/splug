import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/auth/server-auth";
import { mergeCarts, calculateCartTotals } from "@/lib/cart/merge";
import { getStoreSettingsAction } from "@/lib/settings/actions";
import type { CartItem } from "@/lib/cart/types";

export const dynamic = "force-dynamic";

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
 * POST /api/cart/merge
 * Merges local guest cart items into the user's database cart upon sign-in.
 * Body: { localItems: CartItem[] }
 */
export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedContext(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const localItems: CartItem[] = Array.isArray(body?.localItems) ? body.localItems : [];

    // 1. Fetch current database cart
    const { data: dbRows } = await supabase
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

    const dbItems: CartItem[] = [];
    for (const raw of (dbRows as unknown as DbCartItemRecord[]) || []) {
      if (!raw.variant || !raw.variant.is_active) continue;
      const img =
        raw.variant.product?.images?.find((i) => i.is_primary)?.storage_path ||
        raw.variant.product?.images?.[0]?.storage_path;

      dbItems.push({
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

    // 2. Merge database cart and local items
    const merged = mergeCarts(dbItems, localItems);

    // 3. Persist merged items to Supabase
    for (const item of merged) {
      if (item.quantity > 0) {
        await supabase.from("cart_items").upsert(
          {
            user_id: user.id,
            variant_id: item.variantId,
            quantity: item.quantity,
          },
          { onConflict: "user_id,variant_id" }
        );
      }
    }

    const settings = await getStoreSettingsAction();
    const totals = calculateCartTotals(merged, settings.freeShippingThresholdMinor);

    return NextResponse.json({
      success: true,
      message: "Cart merged successfully",
      data: {
        items: merged,
        totals,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to merge cart";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
