import { describe, it, expect } from "vitest";
import {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  getCategories,
  getBrands,
} from "./queries";

describe("Catalog Queries & Filter Engine", () => {
  it("retrieves baseline products with pricing and variant structures", async () => {
    const res = await getProducts();
    expect(res.products.length).toBeGreaterThan(0);
    expect(res.total).toBeGreaterThan(0);

    const first = res.products[0];
    expect(first.id).toBeDefined();
    expect(first.name).toBeDefined();
    expect(first.minPriceMinor).toBeGreaterThan(0);
    expect(Array.isArray(first.variants)).toBe(true);
    expect(first.variants.length).toBeGreaterThan(0);
  });

  it("filters products by text search query", async () => {
    const res = await getProducts({ query: "iPhone" });
    expect(res.products.length).toBeGreaterThan(0);
    expect(res.products.every((p) => p.name.includes("iPhone"))).toBe(true);
  });

  it("filters products by category slug", async () => {
    const res = await getProducts({ category: "phones" });
    expect(res.products.length).toBeGreaterThan(0);
    expect(
      res.products.every((p) => p.category?.slug.toLowerCase() === "phones")
    ).toBe(true);
  });

  it("filters products by brand multi-select", async () => {
    const res = await getProducts({ brand: ["apple"] });
    expect(res.products.length).toBeGreaterThan(0);
    expect(
      res.products.every((p) => p.brand?.slug.toLowerCase() === "apple")
    ).toBe(true);
  });

  it("filters products by price range in minor units", async () => {
    // ₦1,000,000 to ₦2,500,000
    const res = await getProducts({
      minPrice: 100000000,
      maxPrice: 250000000,
    });
    expect(res.products.length).toBeGreaterThan(0);
    expect(
      res.products.every(
        (p) => p.minPriceMinor >= 100000000 && p.minPriceMinor <= 250000000
      )
    ).toBe(true);
  });

  it("sorts products by price ascending", async () => {
    const res = await getProducts({ sort: "price_asc" });
    for (let i = 0; i < res.products.length - 1; i++) {
      expect(res.products[i].minPriceMinor).toBeLessThanOrEqual(
        res.products[i + 1].minPriceMinor
      );
    }
  });

  it("sorts products by price descending", async () => {
    const res = await getProducts({ sort: "price_desc" });
    for (let i = 0; i < res.products.length - 1; i++) {
      expect(res.products[i].minPriceMinor).toBeGreaterThanOrEqual(
        res.products[i + 1].minPriceMinor
      );
    }
  });

  it("retrieves individual product by slug", async () => {
    const product = await getProductBySlug("apple-iphone-16-pro-max");
    expect(product).not.toBeNull();
    expect(product?.name).toBe("Apple iPhone 16 Pro Max");
    expect(product?.variants.length).toBeGreaterThanOrEqual(2);
  });

  it("returns null for non-existent product slug", async () => {
    const product = await getProductBySlug("non-existent-device-2026");
    expect(product).toBeNull();
  });

  it("retrieves related products excluding the current product", async () => {
    const related = await getRelatedProducts(
      "prod-iphone-16-pro-max",
      "phones",
      3
    );
    expect(related.length).toBeGreaterThan(0);
    expect(related.every((p) => p.id !== "prod-iphone-16-pro-max")).toBe(true);
  });

  it("retrieves categories and brands list", async () => {
    const [categories, brands] = await Promise.all([
      getCategories(),
      getBrands(),
    ]);
    expect(categories.length).toBeGreaterThan(0);
    expect(brands.length).toBeGreaterThan(0);
  });
});
