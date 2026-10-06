import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/auth/server-auth";
import type { Address } from "@/lib/types/database";

export const dynamic = "force-dynamic";

/**
 * GET /api/addresses
 * Returns saved addresses for the authenticated customer
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

    const { data: addresses, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: (addresses || []).length,
      data: (addresses || []) as Address[],
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch addresses";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/addresses
 * Add a new delivery address
 * Body: { label?, full_name, phone, address_line1, address_line2?, city, state, country?, is_default? }
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
    const {
      label = "Home",
      full_name,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      country = "NG",
      is_default = false,
    } = body;

    if (!full_name || !phone || !address_line1 || !city || !state) {
      return NextResponse.json(
        {
          success: false,
          error: "Full name, phone, address, city, and state are required",
        },
        { status: 400 }
      );
    }

    // If set to default, clear previous default
    if (is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);
    }

    const { data: address, error } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        label,
        full_name,
        phone,
        address_line1,
        address_line2: address_line2 || null,
        city,
        state,
        country,
        is_default,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Address saved successfully",
      data: address as Address,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to save address";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/addresses
 * Set address as default or update fields
 * Body: { id: string, is_default?: boolean }
 */
export async function PATCH(request: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedContext(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, is_default } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Address ID is required" },
        { status: 400 }
      );
    }

    if (is_default) {
      // Clear previous default
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);

      const { data, error } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Default address updated",
        data,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update address";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/addresses
 * Delete an address
 * Query: ?id=... or Body: { id: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedContext(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    let addressId = searchParams.get("id");

    try {
      const body = await request.json();
      if (body.id) addressId = body.id;
    } catch {
      // Body optional
    }

    if (!addressId) {
      return NextResponse.json(
        { success: false, error: "Address ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", addressId)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to delete address";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
