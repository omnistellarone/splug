import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/auth/server-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/orders
 * Returns all orders for the authenticated customer
 */
export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedContext(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        id,
        status,
        payment_status,
        subtotal_minor,
        discount_minor,
        shipping_minor,
        total_minor,
        payment_reference,
        created_at,
        shipping_full_name,
        shipping_phone,
        shipping_address_line1,
        shipping_city,
        shipping_state,
        order_items (
          id,
          variant_id,
          product_name,
          variant_sku,
          variant_options,
          unit_price_minor,
          quantity,
          line_total_minor,
          image_url
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: (orders || []).length,
      data: orders || [],
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch orders";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
