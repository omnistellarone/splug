import { createClient } from "@/lib/supabase/server";
import { FIXTURE_PRODUCTS } from "./fixtures";
import type {
  CatalogFilterParams,
  CatalogQueryResult,
  ProductWithDetails,
} from "./types";
import type {
  Category,
  Brand,
  Product,
  ProductVariant,
  ProductImage,
} from "@/lib/types/database";

/**
 * Retrieve list of active categories
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (!error && data && data.length > 0) {
      return data as Category[];
    }
  } catch {
    // Fallback to fixture categories
  }

  // Derive from fixtures if DB is empty
  const map = new Map<string, Category>();
  FIXTURE_PRODUCTS.forEach((p) => {
    if (p.category) {
      map.set(p.category.slug, p.category);
    }
  });
  return Array.from(map.values()).sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * Retrieve list of active brands
 */
export async function getBrands(): Promise<Brand[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (!error && data && data.length > 0) {
      return data as Brand[];
    }
  } catch {
    // Fallback
  }

  const map = new Map<string, Brand>();
  FIXTURE_PRODUCTS.forEach((p) => {
    if (p.brand) {
      map.set(p.brand.slug, p.brand);
    }
  });
  return Array.from(map.values());
}

/**
 * Retrieve featured products for storefront homepage
 */
export async function getFeaturedProducts(limit = 8): Promise<ProductWithDetails[]> {
  const result = await getProducts({ limit, sort: "popularity" });
  return result.products;
}

/**
 * Query products with multi-attribute filtering, search, sorting, and pagination
 */
export async function getProducts(
  params: CatalogFilterParams = {}
): Promise<CatalogQueryResult> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, params.limit || 12);

  // We load fixtures as baseline / fallback
  let items = [...FIXTURE_PRODUCTS];

  // Attempt live database read
  try {
    const supabase = await createClient();
    const { data: dbProducts, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(*),
        brand:brands(*),
        variants:product_variants(*),
        images:product_images(*)
      `)
      .eq("is_active", true)
      .eq("is_archived", false);

    if (!error && dbProducts && dbProducts.length > 0) {
      type DbProductRecord = Product & {
        category: Category | null;
        brand: Brand | null;
        variants: ProductVariant[];
        images: ProductImage[];
      };

      const mappedDbProducts = (dbProducts as unknown as DbProductRecord[]).map((p) => {
        const variants = (p.variants || []).filter((v) => v.is_active);
        const prices = variants.map((v) => v.price_minor);
        const minPriceMinor = prices.length ? Math.min(...prices) : 0;
        const maxPriceMinor = prices.length ? Math.max(...prices) : 0;
        const primaryImage =
          p.images?.find((img) => img.is_primary)?.storage_path ||
          p.images?.[0]?.storage_path ||
          undefined;
        const totalStock = variants.reduce((acc, v) => acc + (v.stock || 0), 0);

        return {
          ...p,
          variants,
          images: p.images || [],
          primaryImage,
          minPriceMinor,
          maxPriceMinor,
          compareAtMinor: variants[0]?.compare_at_minor || null,
          hasDiscount: !!variants[0]?.compare_at_minor && variants[0].compare_at_minor > minPriceMinor,
          discountPercentage:
            variants[0]?.compare_at_minor && variants[0].compare_at_minor > minPriceMinor
              ? Math.round(
                  ((variants[0].compare_at_minor - minPriceMinor) /
                    variants[0].compare_at_minor) *
                    100
                )
              : undefined,
          ratingAverage: 4.8,
          ratingCount: 24,
          inStock: totalStock > 0,
          totalStock,
        };
      });

      // Prepend DB products, avoid duplicates if slug matches
      const dbSlugs = new Set(mappedDbProducts.map((p) => p.slug));
      items = [
        ...mappedDbProducts,
        ...FIXTURE_PRODUCTS.filter((f) => !dbSlugs.has(f.slug)),
      ];
    } else if (error) {
      console.warn("getProducts query warning:", error.message);
    }
  } catch (err) {
    console.warn("getProducts exception:", err);
  }

  // 1. Text Search query
  if (params.query?.trim()) {
    const q = params.query.toLowerCase().trim();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.brand?.name.toLowerCase().includes(q) ||
        p.category?.name.toLowerCase().includes(q)
    );
  }

  // 2. Category filter
  if (params.category && params.category !== "all") {
    items = items.filter(
      (p) => p.category?.slug.toLowerCase() === params.category?.toLowerCase()
    );
  }

  // 3. Brand filter (multi-select)
  if (params.brand && params.brand.length > 0) {
    const brandSlugs = params.brand.map((b) => b.toLowerCase());
    items = items.filter((p) =>
      p.brand ? brandSlugs.includes(p.brand.slug.toLowerCase()) : false
    );
  }

  // 4. In Stock only
  if (params.inStockOnly) {
    items = items.filter((p) => p.inStock);
  }

  // 5. On Sale only
  if (params.onSaleOnly) {
    items = items.filter((p) => p.hasDiscount);
  }

  // 6. Price range (minor units)
  if (params.minPrice !== undefined) {
    items = items.filter((p) => p.minPriceMinor >= (params.minPrice || 0));
  }
  if (params.maxPrice !== undefined) {
    items = items.filter((p) => p.minPriceMinor <= (params.maxPrice || Infinity));
  }

  // Available metadata for filters
  const allBrandsMap = new Map<string, { id: string; name: string; slug: string; count: number }>();
  const allCategoriesMap = new Map<string, { id: string; name: string; slug: string; count: number }>();
  let lowestPrice = Infinity;
  let highestPrice = 0;

  items.forEach((p) => {
    if (p.brand) {
      const existing = allBrandsMap.get(p.brand.slug) || {
        id: p.brand.id,
        name: p.brand.name,
        slug: p.brand.slug,
        count: 0,
      };
      existing.count++;
      allBrandsMap.set(p.brand.slug, existing);
    }

    if (p.category) {
      const existing = allCategoriesMap.get(p.category.slug) || {
        id: p.category.id,
        name: p.category.name,
        slug: p.category.slug,
        count: 0,
      };
      existing.count++;
      allCategoriesMap.set(p.category.slug, existing);
    }

    if (p.minPriceMinor < lowestPrice) lowestPrice = p.minPriceMinor;
    if (p.maxPriceMinor > highestPrice) highestPrice = p.maxPriceMinor;
  });

  // 7. Sorting
  const sort = params.sort || "popularity";
  items.sort((a, b) => {
    switch (sort) {
      case "price_asc":
        return a.minPriceMinor - b.minPriceMinor;
      case "price_desc":
        return b.minPriceMinor - a.minPriceMinor;
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "rating":
        return b.ratingAverage - a.ratingAverage;
      case "popularity":
      default:
        return b.ratingCount - a.ratingCount;
    }
  });

  const total = items.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedItems = items.slice(startIndex, startIndex + limit);

  return {
    products: paginatedItems,
    total,
    page,
    limit,
    totalPages,
    availableBrands: Array.from(allBrandsMap.values()),
    availableCategories: Array.from(allCategoriesMap.values()),
    priceRange: {
      min: lowestPrice === Infinity ? 0 : lowestPrice,
      max: highestPrice || 1000000000,
    },
  };
}

/**
 * Retrieve single product with variants by slug
 */
export async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  try {
    const supabase = await createClient();
    const { data: p, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(*),
        brand:brands(*),
        variants:product_variants(*),
        images:product_images(*)
      `)
      .eq("slug", slug)
      .eq("is_active", true)
      .eq("is_archived", false)
      .maybeSingle();

    if (!error && p) {
      type DbProductRecord = Product & {
        category: Category | null;
        brand: Brand | null;
        variants: ProductVariant[];
        images: ProductImage[];
      };
      const dbP = p as unknown as DbProductRecord;
      const variants = (dbP.variants || []).filter((v) => v.is_active);
      const prices = variants.map((v) => v.price_minor);
      const minPriceMinor = prices.length ? Math.min(...prices) : 0;
      const maxPriceMinor = prices.length ? Math.max(...prices) : 0;
      const primaryImage =
        dbP.images?.find((img) => img.is_primary)?.storage_path ||
        dbP.images?.[0]?.storage_path ||
        undefined;
      const totalStock = variants.reduce((acc, v) => acc + (v.stock || 0), 0);

      return {
        ...dbP,
        variants,
        images: dbP.images || [],
        primaryImage,
        minPriceMinor,
        maxPriceMinor,
        compareAtMinor: variants[0]?.compare_at_minor || null,
        hasDiscount: !!variants[0]?.compare_at_minor && variants[0].compare_at_minor > minPriceMinor,
        discountPercentage:
          variants[0]?.compare_at_minor && variants[0].compare_at_minor > minPriceMinor
            ? Math.round(
                ((variants[0].compare_at_minor - minPriceMinor) /
                  variants[0].compare_at_minor) *
                  100
              )
            : undefined,
        ratingAverage: 4.8,
        ratingCount: 24,
        inStock: totalStock > 0,
        totalStock,
      };
    }
  } catch (err) {
    console.warn("getProductBySlug exception:", err);
  }

  // Fallback to fixture catalog
  const found = FIXTURE_PRODUCTS.find((p) => p.slug === slug);
  return found || null;
}

/**
 * Retrieve related products in the same category
 */
export async function getRelatedProducts(
  productId: string,
  categorySlug?: string,
  limit = 4
): Promise<ProductWithDetails[]> {
  const result = await getProducts({ category: categorySlug, limit: limit + 1 });
  return result.products.filter((p) => p.id !== productId).slice(0, limit);
}
