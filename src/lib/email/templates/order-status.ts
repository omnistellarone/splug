import type { OrderEmailData } from "../types";

export function renderOrderStatusEmail(
  data: OrderEmailData,
  newStatus: "processing" | "shipped" | "delivered" | "cancelled" | "refunded",
  note?: string,
  appUrl: string = "https://slurge.ng"
): { html: string; text: string; subject: string } {
  const trackingUrl = `${appUrl}/account/orders/${data.orderId}`;

  const statusConfig: Record<
    string,
    { title: string; color: string; bgColor: string; description: string }
  > = {
    processing: {
      title: "Order is Being Packed",
      color: "#2563eb",
      bgColor: "#eff6ff",
      description:
        "Our warehouse specialists are carefully inspecting and preparing your electronics package.",
    },
    shipped: {
      title: "Order Dispatched & On the Way!",
      color: "#0891b2",
      bgColor: "#ecfeff",
      description:
        "Your package is with our courier partner. Expect delivery within 24-48 hours.",
    },
    delivered: {
      title: "Order Delivered Successfully!",
      color: "#059669",
      bgColor: "#ecfdf5",
      description:
        "Your order has been marked as delivered. We hope you love your new tech! Your 1-year warranty is active.",
    },
    cancelled: {
      title: "Order Cancelled",
      color: "#dc2626",
      bgColor: "#fef2f2",
      description:
        "Your order has been cancelled. Any processed payment will be credited back to your account.",
    },
    refunded: {
      title: "Refund Processed",
      color: "#9333ea",
      bgColor: "#faf5ff",
      description:
        "Your refund has been initiated through Paystack and should reflect in your bank account shortly.",
    },
  };

  const current = statusConfig[newStatus] || statusConfig.processing;
  const subject = `Update on Order ${data.paymentReference || data.orderNumber}: ${current.title}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #09090b; padding: 28px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff;">
                Slurge<span style="color: #3b82f6;">.</span>
              </h1>
            </td>
          </tr>

          <!-- Status Card -->
          <tr>
            <td style="padding: 32px 40px;">
              <div style="background-color: ${current.bgColor}; border: 1px solid ${current.color}33; border-radius: 12px; padding: 18px 24px; text-align: center; margin-bottom: 24px;">
                <span style="color: ${current.color}; font-weight: 800; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${current.title}
                </span>
              </div>

              <h2 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #111827;">
                Hello ${data.customerName},
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
                ${current.description}
              </p>

              ${
                note
                  ? `<div style="background-color: #f9fafb; border-left: 4px solid ${current.color}; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; color: #374151;">
                <strong>Note from fulfillment:</strong> ${note}
              </div>`
                  : ""
              }

              <!-- Meta info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 10px; padding: 14px 18px; margin-bottom: 28px; font-size: 13px;">
                <tr>
                  <td style="color: #6b7280; padding: 4px 0;">Reference:</td>
                  <td align="right" style="font-family: monospace; font-weight: 700; color: #111827; padding: 4px 0;">${data.paymentReference || data.orderId}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; padding: 4px 0;">Delivery Address:</td>
                  <td align="right" style="font-weight: 500; color: #111827; padding: 4px 0;">${data.shippingAddress.city}, ${data.shippingAddress.state}</td>
                </tr>
              </table>

              <!-- Action Button -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${trackingUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 14px;">
                  View Live Order Details →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 40px; text-align: center; font-size: 12px; color: #6b7280;">
              Questions? Reach out to us at <a href="mailto:support@slurge.ng" style="color: #2563eb; text-decoration: none;">support@slurge.ng</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
SLURGE ELECTRONICS — ORDER STATUS UPDATE
=======================================

Hello ${data.customerName},

Status: ${current.title}

${current.description}
${note ? `\nNote: ${note}\n` : ""}
Reference: ${data.paymentReference || data.orderId}
Delivery to: ${data.shippingAddress.city}, ${data.shippingAddress.state}

View live order: ${trackingUrl}
Support: support@slurge.ng
  `.trim();

  return { html, text, subject };
}
