import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
 * GET /api/orders/[id]
 * Fetch single order detail with order line items
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, user } = await getAuthUser(request);

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
