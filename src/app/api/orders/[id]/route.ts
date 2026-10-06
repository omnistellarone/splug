import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/auth/server-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/orders/[id]
 * Fetch single order detail with order line items and status tracking history
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, user } = await getAuthenticatedContext(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: orderId } = await context.params;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
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
        ),
        order_status_history (
          id,
          from_status,
          to_status,
          note,
          created_at
        )
      `)
      .eq("id", orderId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch order";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
