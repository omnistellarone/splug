import { NextRequest, NextResponse } from "next/server";
import {
  getStoreSettingsAction,
  updateFreeShippingThresholdAction,
} from "@/lib/settings/actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/settings
 * Returns public store operational settings
 */
export async function GET() {
  try {
    const settings = await getStoreSettingsAction();
    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch settings";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/settings
 * Admin only: update store threshold or settings
 * Body: { freeShippingThresholdNaira: number }
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const authHeader = request.headers.get("authorization");
    let user = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const { data } = await supabase.auth.getUser(token);
      user = data.user;
    } else {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check admin role
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { freeShippingThresholdNaira } = body;

    if (typeof freeShippingThresholdNaira !== "number") {
      return NextResponse.json(
        {
          success: false,
          error: "freeShippingThresholdNaira must be a valid number",
        },
        { status: 400 }
      );
    }

    const result = await updateFreeShippingThresholdAction(
      freeShippingThresholdNaira
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    const updated = await getStoreSettingsAction();

    return NextResponse.json({
      success: true,
      message: "Store settings updated successfully",
      data: updated,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update settings";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
