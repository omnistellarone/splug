import { NextRequest, NextResponse } from "next/server";
import { initializeCheckoutOrderAction } from "@/lib/checkout/actions";
import { getAuthenticatedContext } from "@/lib/auth/server-auth";
import type { CreateOrderParams } from "@/lib/checkout/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/checkout
 * Initializes a checkout order and returns the Paystack authorization URL
 * Body: { items, shippingAddress, couponCode?, notes?, callbackUrl? }
 */
export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedContext(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to checkout" },
        { status: 401 }
      );
    }

    const body: CreateOrderParams & { callbackUrl?: string } = await request.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart items cannot be empty" },
        { status: 400 }
      );
    }

    if (!body.shippingAddress) {
      return NextResponse.json(
        { success: false, error: "Shipping address is required" },
        { status: 400 }
      );
    }

    const result = await initializeCheckoutOrderAction(body, {
      user,
      supabase,
      callbackUrl: body.callbackUrl,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order created and payment initialized",
      data: {
        orderId: result.orderId,
        authorizationUrl: result.authorizationUrl,
        reference: result.reference,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Checkout initialization failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
