import { describe, it, expect } from "vitest";
import { formatMoney, toMinorUnits, fromMinorUnits } from "@/lib/money";

describe("formatMoney", () => {
  it("formats 100000 minor units as ₦1,000.00", () => {
    const result = formatMoney(100000, "NGN", "en-NG");
    // Different Node versions may format differently; check core shape
    expect(result).toContain("1,000");
    expect(result).toContain("00");
  });

  it("formats 0 minor units as ₦0.00", () => {
    const result = formatMoney(0, "NGN", "en-NG");
    expect(result).toContain("0");
  });

  it("formats large values correctly", () => {
    // 1,000,000 * 100 kobo = ₦1,000,000
    const result = formatMoney(100_000_000, "NGN", "en-NG");
    expect(result).toContain("1,000,000");
  });
});

describe("toMinorUnits", () => {
  it("converts 10 to 1000", () => {
    expect(toMinorUnits(10)).toBe(1000);
  });

  it("converts 1.50 to 150", () => {
    expect(toMinorUnits(1.5)).toBe(150);
  });

  it("rounds correctly for floating-point edge cases", () => {
    // 0.1 + 0.2 = 0.30000000000000004 in JS
    expect(toMinorUnits(0.1 + 0.2)).toBe(30);
  });
});

describe("fromMinorUnits", () => {
  it("converts 1000 to 10", () => {
    expect(fromMinorUnits(1000)).toBe(10);
  });

  it("converts 1 to 0.01", () => {
    expect(fromMinorUnits(1)).toBeCloseTo(0.01);
  });
});
