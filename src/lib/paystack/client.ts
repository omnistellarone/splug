import "server-only";

import type {
  PaystackInitializeParams,
  PaystackInitializeResponse,
  PaystackVerifyResponse,
} from "./types";

const PAYSTACK_API_BASE = "https://api.paystack.co";

function getSecretKey(): string | null {
  return process.env.PAYSTACK_SECRET_KEY || null;
}

/**
 * Initializes a payment transaction with Paystack.
 * AGENTS.md §16:
 * - Server only.
 * - All amounts in kobo (minor units).
 */
export async function initializePaystackTransaction(
  params: PaystackInitializeParams
): Promise<PaystackInitializeResponse> {
  const secretKey = getSecretKey();

  // If secret key is not yet set in environment, provide local simulation fallback
  if (!secretKey || secretKey.startsWith("sk_test_placeholder") || secretKey === "sk_test_your_paystack_secret_key") {
    console.warn(
      "[Paystack] PAYSTACK_SECRET_KEY is not configured with a valid key. Using local simulation mode."
    );
    const callback = params.callbackUrl || "/api/payments/paystack/verify";
    const simUrl = `${callback}?reference=${encodeURIComponent(params.reference)}&simulated=true`;

    return {
      status: true,
      message: "Simulation authorization URL generated",
      data: {
        authorization_url: simUrl,
        access_code: `mock_code_${params.reference}`,
        reference: params.reference,
      },
    };
  }

  const response = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountMinor, // Paystack requires integer kobo
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
      channels: params.channels,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[Paystack] Initialization error:", response.status, errorBody);
    throw new Error(`Paystack initialization failed: ${response.statusText}`);
  }

  const data = (await response.json()) as PaystackInitializeResponse;
  return data;
}

/**
 * Verifies a payment transaction with Paystack API.
 * AGENTS.md §16:
 * - Server only.
 * - Never trust client redirect query alone.
 */
export async function verifyPaystackTransaction(
  reference: string
): Promise<PaystackVerifyResponse> {
  const secretKey = getSecretKey();

  // Handle local simulated transactions
  if (!secretKey || secretKey.startsWith("sk_test_placeholder") || secretKey === "sk_test_your_paystack_secret_key") {
    console.warn(
      "[Paystack] PAYSTACK_SECRET_KEY is not configured with a valid key. Verifying under simulation mode."
    );

    return {
      status: true,
      message: "Verification successful (simulated)",
      data: {
        id: 999999,
        domain: "test",
        status: "success",
        reference,
        amount: 0, // In simulation mode, will be checked against order total
        currency: "NGN",
        paid_at: new Date().toISOString(),
        channel: "card",
        customer: {
          id: 1,
          email: "customer@example.com",
          customer_code: "CUS_simulated",
        },
      },
    };
  }

  const response = await fetch(
    `${PAYSTACK_API_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[Paystack] Verification error:", response.status, errorBody);
    throw new Error(`Paystack verification request failed: ${response.statusText}`);
  }

  const data = (await response.json()) as PaystackVerifyResponse;
  return data;
}
