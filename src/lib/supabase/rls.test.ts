import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qnjrvsigzdkazghsqfjr.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_-qLA8eu_1IduqfJ3_xYyLQ_69Hkj2KU";

describe("Supabase Row Level Security (RLS) policies", () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  it("permits unauthenticated public reads of active categories", async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug")
      .limit(5);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
    expect(data!.length).toBeGreaterThan(0);
  });

  it("permits unauthenticated public reads of active brands", async () => {
    const { data, error } = await supabase
      .from("brands")
      .select("id, name, slug")
      .limit(5);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
    expect(data!.length).toBeGreaterThan(0);
  });

  it("protects orders: unauthenticated query returns 0 rows", async () => {
    const { data, error } = await supabase.from("orders").select("id");
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("protects user addresses: unauthenticated query returns 0 rows", async () => {
    const { data, error } = await supabase.from("addresses").select("id");
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("protects cart items: unauthenticated query returns 0 rows", async () => {
    const { data, error } = await supabase.from("cart_items").select("id");
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("protects user roles: unauthenticated query returns 0 rows", async () => {
    const { data, error } = await supabase.from("user_roles").select("id");
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("protects payment records: unauthenticated query returns 0 rows", async () => {
    const { data, error } = await supabase.from("payment_records").select("id");
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("blocks unauthorized insert into categories via RLS", async () => {
    const { error } = await supabase
      .from("categories")
      .insert({ name: "Unauthorized Hack", slug: "unauthorized-hack" });

    expect(error).not.toBeNull();
    expect(error?.code).toBe("42501"); // Postgres insufficient_privilege
  });

  it("blocks self-assignment of admin role via RLS", async () => {
    const { error } = await supabase.from("user_roles").insert({
      user_id: "00000000-0000-0000-0000-000000000000",
      role: "admin",
    });

    expect(error).not.toBeNull();
    expect(error?.code).toBe("42501"); // Postgres insufficient_privilege
  });
});
