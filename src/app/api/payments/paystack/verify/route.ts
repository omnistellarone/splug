import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackTransaction } from "@/lib/paystack/client";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const reference = searchParams.get("reference");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!reference) {
    return NextResponse.redirect(
      new URL("/checkout/failure?reason=missing_reference", appUrl)
    );
  }

  try {
    // 1. Verify transaction with Paystack server-side — AGENTS.md §16
    const verification = await verifyPaystackTransaction(reference);

    if (verification.data.status !== "success") {
      console.warn(
        `[Paystack Verify] Reference ${reference} status: ${verification.data.status}`
      );
      return NextResponse.redirect(
        new URL(
          `/checkout/failure?ref=${encodeURIComponent(reference)}&reason=${encodeURIComponent(
            verification.data.status
          )}`,
          appUrl
        )
      );
    }

    // 2. Fetch order matching payment reference
    const supabaseAdmin = createAdminClient();
    interface OrderLookup {
      id: string;
      total_minor: number;
      status: string;
      payment_status: string;
    }

    const { data: rawOrder, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, total_minor, status, payment_status")
      .eq("payment_reference", reference)
      .maybeSingle();

    const order = rawOrder as OrderLookup | null;

    if (orderError || !order) {
      console.error(
        `[Paystack Verify] Order not found for reference ${reference}`
      );
      return NextResponse.redirect(
        new URL(
          `/checkout/failure?ref=${encodeURIComponent(reference)}&reason=order_not_found`,
          appUrl
        )
      );
    }

    // 3. Atomically finalize payment & decrement stock via PostgreSQL RPC — AGENTS.md §14, §16
    const adminRpcCaller = supabaseAdmin as unknown as {
      rpc: (
        fn: string,
        args: Record<string, unknown>
      ) => Promise<{ data: unknown; error: Error | null }>;
    };

    const { data: finalizeRes, error: rpcError } = await adminRpcCaller.rpc(
      "finalize_payment",
      {
        p_order_id: order.id,
        p_paystack_reference: reference,
        p_amount_minor: order.total_minor,
        p_event_type: "redirect_verification",
        p_raw_payload: verification.data,
      }
    );

    if (rpcError) {
      console.error("[Paystack Verify] finalize_payment RPC error:", rpcError);
    } else {
      console.log(
        `[Paystack Verify] finalize_payment completed for ${reference}:`,
        finalizeRes
      );

      // 4. Send transactional order confirmation email via Mailgun — AGENTS.md §17
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
            authUser?.user?.email || verification.data.customer?.email;

          if (recipientEmail) {
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
              console.error("[Email Service] Background delivery failure:", e)
            );
          }
        }
      } catch (emailErr) {
        console.error(
          "[Email Service] Error preparing confirmation email:",
          emailErr
        );
      }
    }

    // 5. Redirect to customer order confirmation screen
    return NextResponse.redirect(
      new URL(
        `/checkout/success?ref=${encodeURIComponent(reference)}&orderId=${order.id}`,
        appUrl
      )
    );
  } catch (error) {
    console.error("[Paystack Verify] Unexpected error during verification:", error);
    return NextResponse.redirect(
      new URL(
        `/checkout/failure?ref=${encodeURIComponent(reference)}&reason=verification_error`,
        appUrl
      )
    );
  }
}
