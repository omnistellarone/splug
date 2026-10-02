import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDatabaseCartAction } from "@/lib/cart/actions";
import { calculateCartTotals } from "@/lib/cart/merge";
import { getStoreSettingsAction } from "@/lib/settings/actions";

export const dynamic = "force-dynamic";

async function getAuthUser(request: NextRequest) {
  const supabase = await createClient();
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (!error && user) return { supabase, user };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/**
 * GET /api/cart
 * Returns the authenticated user's cart items and calculated totals
 */
export async function GET(request: NextRequest) {
  try {
    const { user } = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const items = (await getDatabaseCartAction()) || [];
    const settings = await getStoreSettingsAction();
    const totals = calculateCartTotals(items, settings.freeShippingThresholdMinor);

    return NextResponse.json({
      success: true,
      data: {
        items,
        totals,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch cart";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart
 * Add or update item quantity in cart
 * Body: { variantId: string, quantity: number }
 */
export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { variantId, quantity } = body;

    if (!variantId || typeof quantity !== "number") {
      return NextResponse.json(
        { success: false, error: "variantId and numeric quantity are required" },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .eq("variant_id", variantId);
    } else {
      // Validate variant existence and available stock
      const { data: variant, error: varError } = await supabase
        .from("product_variants")
        .select("id, stock, is_active")
        .eq("id", variantId)
        .maybeSingle();

      if (varError || !variant || !variant.is_active) {
        return NextResponse.json(
          { success: false, error: "Product variant not available" },
          { status: 404 }
        );
      }

      const safeQty = Math.min(quantity, variant.stock);

      const { error: upsertError } = await supabase.from("cart_items").upsert(
        {
          user_id: user.id,
          variant_id: variantId,
          quantity: safeQty,
        },
        { onConflict: "user_id,variant_id" }
      );

      if (upsertError) {
        return NextResponse.json(
          { success: false, error: upsertError.message },
          { status: 500 }
        );
      }
    }

    const updatedItems = (await getDatabaseCartAction()) || [];
    const settings = await getStoreSettingsAction();
    const totals = calculateCartTotals(updatedItems, settings.freeShippingThresholdMinor);

    return NextResponse.json({
      success: true,
      message: "Cart updated successfully",
      data: {
        items: updatedItems,
        totals,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update cart";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart
 * Remove an item or clear the entire cart
 * Body: { variantId?: string, clearAll?: boolean }
 */
export async function DELETE(request: NextRequest) {
  try {
    const { supabase, user } = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const variantIdFromQuery = searchParams.get("variantId");
    let variantId = variantIdFromQuery;
    let clearAll = searchParams.get("clearAll") === "true";

    try {
      const body = await request.json();
      if (body.variantId) variantId = body.variantId;
      if (body.clearAll) clearAll = true;
    } catch {
      // body optional if params passed in URL
    }

    if (clearAll) {
      await supabase.from("cart_items").delete().eq("user_id", user.id);
    } else if (variantId) {
      await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .eq("variant_id", variantId);
    } else {
      return NextResponse.json(
        { success: false, error: "variantId or clearAll is required" },
        { status: 400 }
      );
    }

    const updatedItems = (await getDatabaseCartAction()) || [];
    const settings = await getStoreSettingsAction();
    const totals = calculateCartTotals(updatedItems, settings.freeShippingThresholdMinor);

    return NextResponse.json({
      success: true,
      message: clearAll ? "Cart cleared" : "Item removed",
      data: {
        items: updatedItems,
        totals,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to remove cart item";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
