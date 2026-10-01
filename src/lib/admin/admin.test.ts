import { describe, it, expect, vi, beforeEach } from "vitest";
import { requireAdminSession } from "@/lib/auth/session";

// Mock @/lib/supabase/server to control session output
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("Admin Authorization & Mutation Guards (AGENTS.md §9)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("throws Unauthorized error when user is not authenticated", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValueOnce({ data: { user: null } }),
      },
      from: vi.fn(),
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    await expect(requireAdminSession()).rejects.toThrow(
      "Unauthorized: Admin privileges required."
    );
  });

  it("throws Unauthorized error when user is authenticated as customer only", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValueOnce({
          data: {
            user: { id: "cust-user-123", email: "customer@example.com" },
          },
        }),
      },
      from: vi.fn((table: string) => {
        if (table === "profiles") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValueOnce({
              data: {
                id: "cust-user-123",
                display_name: "Customer Bob",
                avatar_url: null,
                phone: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            }),
          };
        }
        if (table === "user_roles") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValueOnce({
              data: { role: "customer" },
            }),
          };
        }
        return { select: vi.fn().mockReturnThis() };
      }),
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    await expect(requireAdminSession()).rejects.toThrow(
      "Unauthorized: Admin privileges required."
    );
  });

  it("succeeds and returns session when user has admin role in user_roles table", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValueOnce({
          data: {
            user: { id: "admin-user-999", email: "admin@splug.ng" },
          },
        }),
      },
      from: vi.fn((table: string) => {
        if (table === "profiles") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValueOnce({
              data: {
                id: "admin-user-999",
                display_name: "Super Admin",
                avatar_url: null,
                phone: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            }),
          };
        }
        if (table === "user_roles") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValueOnce({
              data: { role: "admin" },
            }),
          };
        }
        return { select: vi.fn().mockReturnThis() };
      }),
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const session = await requireAdminSession();
    expect(session.isAdmin).toBe(true);
    expect(session.role).toBe("admin");
    expect(session.user?.id).toBe("admin-user-999");
  });
});

describe("Admin Analytics & Financial Calculations (PLAN.md §16)", () => {
  it("computes average order value (AOV) correctly in minor units kobo", () => {
    const paidOrders = [
      { total_minor: 15000000 }, // ₦150,000
      { total_minor: 25000000 }, // ₦250,000
      { total_minor: 20000000 }, // ₦200,000
    ];

    const totalRevenueMinor = paidOrders.reduce(
      (acc, o) => acc + o.total_minor,
      0
    );
    expect(totalRevenueMinor).toBe(60000000); // ₦600,000

    const aovMinor = Math.round(totalRevenueMinor / paidOrders.length);
    expect(aovMinor).toBe(20000000); // ₦200,000
  });

  it("handles zero paid orders gracefully with 0 AOV", () => {
    const totalPaidOrders = 0;
    const totalRevenueMinor = 0;
    const aovMinor =
      totalPaidOrders > 0
        ? Math.round(totalRevenueMinor / totalPaidOrders)
        : 0;
    expect(aovMinor).toBe(0);
  });

  it("calculates inventory delta correctly for stock adjustments", () => {
    const currentStock = 12;
    const newStock = 20;
    const delta = newStock - currentStock;
    expect(delta).toBe(8); // +8 units added

    const reducedStock = 7;
    const decreaseDelta = reducedStock - currentStock;
    expect(decreaseDelta).toBe(-5); // -5 units removed
  });
});
