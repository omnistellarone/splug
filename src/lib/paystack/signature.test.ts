import { describe, it, expect } from "vitest";
import { createHmac } from "crypto";
import { verifyPaystackSignature } from "./signature";

describe("Paystack Webhook Signature Verification", () => {
  const secretKey = "sk_test_fake_paystack_secret_123456789";
  const rawBody = JSON.stringify({
    event: "charge.success",
    data: {
      reference: "splug_ord_1727800000000_abc123",
      amount: 15000000,
      currency: "NGN",
      status: "success",
    },
  });

  it("verifies a valid Paystack webhook signature successfully", () => {
    const validSignature = createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex");

    const result = verifyPaystackSignature(rawBody, validSignature, secretKey);
    expect(result).toBe(true);
  });

  it("rejects an invalid/tampered signature", () => {
    const invalidSignature =
      "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

    const result = verifyPaystackSignature(rawBody, invalidSignature, secretKey);
    expect(result).toBe(false);
  });

  it("rejects when the payload has been tampered with", () => {
    const validSignature = createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex");

    const tamperedBody = JSON.stringify({
      event: "charge.success",
      data: {
        reference: "splug_ord_1727800000000_abc123",
        amount: 500000, // attacker tried reducing amount
        currency: "NGN",
        status: "success",
      },
    });

    const result = verifyPaystackSignature(tamperedBody, validSignature, secretKey);
    expect(result).toBe(false);
  });

  it("rejects when signature is missing, null, or empty", () => {
    expect(verifyPaystackSignature(rawBody, "", secretKey)).toBe(false);
    expect(verifyPaystackSignature(rawBody, null, secretKey)).toBe(false);
    expect(verifyPaystackSignature(rawBody, undefined, secretKey)).toBe(false);
  });

  it("rejects when secret key is empty", () => {
    const signature = createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex");

    expect(verifyPaystackSignature(rawBody, signature, "")).toBe(false);
  });

  it("handles Buffer bodies correctly", () => {
    const buffer = Buffer.from(rawBody, "utf8");
    const validSignature = createHmac("sha512", secretKey)
      .update(buffer)
      .digest("hex");

    expect(verifyPaystackSignature(buffer, validSignature, secretKey)).toBe(true);
  });
});
