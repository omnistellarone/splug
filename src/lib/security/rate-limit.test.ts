import { describe, it, expect } from "vitest";
import { checkRateLimit } from "./rate-limit";

describe("Rate Limiting Engine (AGENTS.md §23, PLAN.md §16)", () => {
  it("permits requests within specified limit and tracks remaining quota", () => {
    const ip = "client-ip-test-1";
    const res1 = checkRateLimit(ip, { limit: 3, windowMs: 5000 });
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = checkRateLimit(ip, { limit: 3, windowMs: 5000 });
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = checkRateLimit(ip, { limit: 3, windowMs: 5000 });
    expect(res3.allowed).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it("blocks requests that exceed the rate limit", () => {
    const ip = "client-ip-test-2";
    // Fire 2 allowed requests
    checkRateLimit(ip, { limit: 2, windowMs: 5000 });
    checkRateLimit(ip, { limit: 2, windowMs: 5000 });

    // 3rd attempt must be rejected
    const blockedRes = checkRateLimit(ip, { limit: 2, windowMs: 5000 });
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.remaining).toBe(0);
    expect(blockedRes.resetMs).toBeGreaterThan(0);
  });

  it("isolates counters between different client identifiers", () => {
    const ip1 = "user-a";
    const ip2 = "user-b";

    checkRateLimit(ip1, { limit: 1, windowMs: 5000 });
    const blockedIp1 = checkRateLimit(ip1, { limit: 1, windowMs: 5000 });
    expect(blockedIp1.allowed).toBe(false);

    // ip2 should still be allowed
    const allowedIp2 = checkRateLimit(ip2, { limit: 1, windowMs: 5000 });
    expect(allowedIp2.allowed).toBe(true);
  });
});
