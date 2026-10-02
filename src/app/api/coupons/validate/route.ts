import { NextRequest, NextResponse } from "next/server";
import { validateCouponAction } from "@/lib/checkout/actions";

export const dynamic = "force-dynamic";

/**
 * POST /api/coupons/validate
 * Validates a coupon code against a subtotal
 * Body: { code: string, subtotalMinor: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, subtotalMinor } = body;

    if (!code || typeof subtotalMinor !== "number") {
      return NextResponse.json(
        {
          success: false,
          error: "Coupon code and numeric subtotalMinor are required",
        },
        { status: 400 }
      );
    }

    const result = await validateCouponAction(code, subtotalMinor);

    return NextResponse.json({
      success: result.valid,
      data: result,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Coupon validation failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
