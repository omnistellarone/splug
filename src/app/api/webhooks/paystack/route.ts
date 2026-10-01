import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackSignature } from "@/lib/paystack/signature";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PaystackWebhookEvent } from "@/lib/paystack/types";

/**
 * Paystack Webhook Handler — AGENTS.md §14, §16
 *
 * Rules:
 * - Read raw request body.
 * - Verify x-paystack-signature with HMAC SHA-512.
 * - Match expected amount/reference.
 * - Atomic & idempotent fulfillment via finalize_payment RPC.
 * - Return HTTP 200 promptly.
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-paystack-signature");
  const secretKey = process.env.PAYSTACK_SECRET_KEY || "";

  // 1. Read raw request text
  const rawBody = await request.text();

  // 2. Validate HMAC SHA-512 signature
  // In development / local testing without secret key set, allow simulated webhook testing
  const isDevOrTest =
    process.env.NODE_ENV !== "production" &&
    (!secretKey || secretKey.startsWith("sk_test_placeholder"));

  if (!isDevOrTest) {
    const isValid = verifyPaystackSignature(rawBody, signature, secretKey);
    if (!isValid) {
      console.warn("[Paystack Webhook] Invalid signature rejected.");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }
  }

  // 3. Parse webhook payload
  let payload: PaystackWebhookEvent;
  try {
    payload = JSON.parse(rawBody);
  } catch (err) {
    console.error("[Paystack Webhook] Failed to parse JSON:", err);
    return NextResponse.json(
      { error: "Invalid payload JSON" },
      { status: 400 }
    );
  }

  // 4. Handle 'charge.success'
  if (payload.event === "charge.success") {
    const { reference, amount: reportedAmountMinor } = payload.data;

    if (!reference) {
      return NextResponse.json(
        { error: "Missing reference in charge.success" },
        { status: 400 }
      );
    }

    try {
      const supabaseAdmin = createAdminClient();

      interface OrderLookup {
        id: string;
        total_minor: number;
        status: string;
      }

      // Find order by reference
      const { data: rawOrder, error: orderError } = await supabaseAdmin
        .from("orders")
        .select("id, total_minor, status")
        .eq("payment_reference", reference)
        .maybeSingle();

      const order = rawOrder as OrderLookup | null;

      if (orderError || !order) {
        console.error(
          `[Paystack Webhook] Order with reference ${reference} not found.`
        );
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      // Execute atomic finalization RPC (idempotency, payment status, inventory decrement, movement logging)
      interface FinalizeRpcResponse {
        ok: boolean;
        idempotent?: boolean;
        error?: string;
      }

      const adminRpcCaller = supabaseAdmin as unknown as {
        rpc: (
          fn: string,
          args: Record<string, unknown>
        ) => Promise<{ data: FinalizeRpcResponse | null; error: Error | null }>;
      };

      const { data: finalizeResult, error: rpcError } =
        await adminRpcCaller.rpc(
          "finalize_payment",
          {
            p_order_id: order.id,
            p_paystack_reference: reference,
            p_amount_minor: reportedAmountMinor,
            p_event_type: payload.event,
            p_raw_payload: payload.data,
          }
        );

      if (rpcError) {
        console.error("[Paystack Webhook] finalize_payment RPC error:", rpcError);
        return NextResponse.json(
          { error: "Database fulfillment error", details: rpcError.message },
          { status: 500 }
        );
      }

      console.log(
        `[Paystack Webhook] Fulfilled order ${order.id} for reference ${reference}:`,
        finalizeResult
      );

      // Send confirmation email only on first fulfillment (not replayed webhooks) — AGENTS.md §17
      if (!finalizeResult?.idempotent) {
        try {
          const { data: rawDetails } = await supabaseAdmin
            .from("orders")
            .select(`
              id,
              user_id,
              payment_reference,
              shipping_name,
              shipping_phone,
              shipping_address1,
              shipping_address2,
              shipping_city,
              shipping_state,
              shipping_country,
              subtotal_minor,
              shipping_minor,
              discount_minor,
              total_minor,
              coupon_code,
              order_items (
                product_name,
                variant_options,
                quantity,
                unit_price_minor,
                line_total_minor
              )
            `)
            .eq("id", order.id)
            .single();

          interface FullOrderRecord {
            id: string;
            user_id: string;
            payment_reference: string | null;
            shipping_name: string;
            shipping_phone: string;
            shipping_address1: string;
            shipping_address2: string | null;
            shipping_city: string;
            shipping_state: string;
            shipping_country: string;
            subtotal_minor: number;
            shipping_minor: number;
            discount_minor: number;
            total_minor: number;
            coupon_code: string | null;
            order_items: Array<{
              product_name: string;
              variant_options: Record<string, string>;
              quantity: number;
              unit_price_minor: number;
              line_total_minor: number;
            }>;
          }

          const orderDetails = rawDetails as unknown as FullOrderRecord | null;
          if (orderDetails) {
            const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(
              orderDetails.user_id
            );
            const recipientEmail =
              authUser?.user?.email || payload.data.customer?.email;

            if (recipientEmail && typeof recipientEmail === "string") {
              const rawItems = orderDetails.order_items || [];

              const { sendOrderConfirmation } = await import("@/lib/email/service");
              sendOrderConfirmation({
                orderId: orderDetails.id,
                orderNumber: orderDetails.id.substring(0, 8).toUpperCase(),
                customerEmail: recipientEmail,
                customerName: orderDetails.shipping_name,
                status: "paid",
                subtotalMinor: orderDetails.subtotal_minor,
                shippingMinor: orderDetails.shipping_minor,
                discountMinor: orderDetails.discount_minor,
                totalMinor: orderDetails.total_minor,
                couponCode: orderDetails.coupon_code,
                shippingAddress: {
                  full_name: orderDetails.shipping_name,
                  phone: orderDetails.shipping_phone,
                  address_line1: orderDetails.shipping_address1,
                  address_line2: orderDetails.shipping_address2,
                  city: orderDetails.shipping_city,
                  state: orderDetails.shipping_state,
                  country: orderDetails.shipping_country,
                },
                items: rawItems.map((i) => ({
                  name: i.product_name,
                  variantName: Object.values(i.variant_options || {})
                    .filter(Boolean)
                    .join(" • "),
                  quantity: i.quantity,
                  unitPriceMinor: i.unit_price_minor,
                  lineTotalMinor: i.line_total_minor,
                })),
                paymentReference: orderDetails.payment_reference,
              }).catch((e) =>
                console.error("[Email Service] Webhook delivery exception:", e)
              );
            }
          }
        } catch (emailErr) {
          console.error(
            "[Email Service] Error preparing webhook confirmation email:",
            emailErr
          );
        }
      }

      return NextResponse.json({
        status: "success",
        idempotent: finalizeResult?.idempotent ?? false,
      });
    } catch (dbErr) {
      console.error("[Paystack Webhook] Internal processing error:", dbErr);
      return NextResponse.json(
        { error: "Internal processing error" },
        { status: 500 }
      );
    }
  }

  // Return HTTP 200 for other non-payment events to acknowledge receipt
  return NextResponse.json({ received: true });
}
