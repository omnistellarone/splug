import { createHmac, timingSafeEqual } from "crypto";

/**
 * Validates the Paystack webhook signature using HMAC SHA-512.
 * AGENTS.md §16:
 * - Verify x-paystack-signature.
 * - Use raw request body correctly.
 * - Server-only computation.
 */
export function verifyPaystackSignature(
  rawBody: string | Buffer,
  signature: string | null | undefined,
  secretKey: string
): boolean {
  if (!signature || !secretKey) {
    return false;
  }

  try {
    const computedHmac = createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex");

    const computedBuffer = Buffer.from(computedHmac, "utf8");
    const signatureBuffer = Buffer.from(signature, "utf8");

    if (computedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return timingSafeEqual(computedBuffer, signatureBuffer);
  } catch (error) {
    console.error("Error verifying Paystack signature:", error);
    return false;
  }
}
