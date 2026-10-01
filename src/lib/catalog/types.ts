import type {
  Product,
  ProductVariant,
  ProductImage,
  Category,
  Brand,
} from "@/lib/types/database";

export interface ProductVariantWithDetails extends ProductVariant {
  options: Record<string, string>;
}

export interface ProductWithDetails extends Product {
  category?: Category | null;
  brand?: Brand | null;
  variants: ProductVariantWithDetails[];
  images: ProductImage[];
  primaryImage?: string;
  minPriceMinor: number;
  maxPriceMinor: number;
  compareAtMinor?: number | null;
  hasDiscount: boolean;
  discountPercentage?: number;
  ratingAverage: number;
  ratingCount: number;
  inStock: boolean;
  totalStock: number;
}

export interface CatalogFilterParams {
  query?: string;
  category?: string;
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
  sort?:
    | "popularity"
    | "newest"
    | "price_asc"
    | "price_desc"
    | "rating";
  page?: number;
  limit?: number;
}

export interface CatalogQueryResult {
  products: ProductWithDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  availableBrands: { id: string; name: string; slug: string; count: number }[];
  availableCategories: { id: string; name: string; slug: string; count: number }[];
  priceRange: { min: number; max: number };
}
