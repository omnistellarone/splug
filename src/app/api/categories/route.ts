import { NextResponse } from "next/server";
import { getCategories } from "@/lib/catalog/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch categories";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
