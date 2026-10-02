import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/catalog/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category") || undefined;
    const query = searchParams.get("q") || searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const minPriceRaw = searchParams.get("minPrice");
    const maxPriceRaw = searchParams.get("maxPrice");
    const minPrice = minPriceRaw ? parseInt(minPriceRaw, 10) : undefined;
    const maxPrice = maxPriceRaw ? parseInt(maxPriceRaw, 10) : undefined;

    const sortRaw = searchParams.get("sort");
    const sort =
      sortRaw === "price_asc" ||
      sortRaw === "price_desc" ||
      sortRaw === "newest" ||
      sortRaw === "rating" ||
      sortRaw === "popularity"
        ? sortRaw
        : undefined;

    const result = await getProducts({
      category,
      query,
      page,
      limit,
      minPrice,
      maxPrice,
      sort,
    });

    return NextResponse.json({
      success: true,
      data: result.products,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasMore: result.page < result.totalPages,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch products";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
