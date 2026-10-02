import { formatMoney } from "@/lib/money";
import type { OrderEmailData } from "../types";

export function renderOrderConfirmationEmail(
  data: OrderEmailData,
  appUrl: string = "https://slurge.ng"
): { html: string; text: string } {
  const trackingUrl = `${appUrl}/account/orders/${data.orderId}`;

  // Build items rows for HTML table
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
        <div style="font-weight: 600; font-size: 14px; color: #111827;">${item.name}</div>
        ${
          item.variantName
            ? `<div style="font-size: 12px; color: #6b7280; margin-top: 2px;">${item.variantName}</div>`
            : ""
        }
        <div style="font-size: 12px; color: #9ca3af; margin-top: 2px;">Qty: ${item.quantity} × ${formatMoney(item.unitPriceMinor)}</div>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; font-size: 14px; color: #111827; vertical-align: top;">
        ${formatMoney(item.lineTotalMinor)}
      </td>
    </tr>
  `
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Slurge Order is Confirmed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #09090b; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                Slurge<span style="color: #3b82f6;">.</span>
              </h1>
              <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 13px; font-weight: 500;">
                Premium Electronics & Certified Gadgets
              </p>
            </td>
          </tr>

          <!-- Confirmation Pill -->
          <tr>
            <td style="padding: 32px 40px 16px 40px;">
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px 20px; text-align: center; margin-bottom: 24px;">
                <span style="color: #059669; font-weight: 700; font-size: 14px;">
                  ✓ Payment Verified & Order Confirmed
                </span>
              </div>

              <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #111827;">
                Hello ${data.customerName},
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
                Thank you for choosing Slurge. We’ve received your payment and our warehouse team is preparing your brand-new electronics for dispatch.
              </p>

              <!-- Order Details Meta -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px; font-size: 13px;">
                <tr>
                  <td style="color: #6b7280; padding: 4px 0;">Order Reference:</td>
                  <td align="right" style="font-family: monospace; font-weight: 700; color: #111827; padding: 4px 0;">${data.paymentReference || data.orderId.substring(0, 13)}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; padding: 4px 0;">Order Status:</td>
                  <td align="right" style="font-weight: 600; color: #059669; padding: 4px 0; text-transform: uppercase;">Paid & Processing</td>
                </tr>
              </table>

              <!-- Order Items Table -->
              <h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: #111827;">
                Items in Your Order
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                ${itemsHtml}
              </table>

              <!-- Financial Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px; font-size: 13px;">
                <tr>
                  <td style="padding: 4px 0; color: #6b7280;">Subtotal:</td>
                  <td align="right" style="padding: 4px 0; font-weight: 600; color: #111827;">${formatMoney(data.subtotalMinor)}</td>
                </tr>
                ${
                  data.discountMinor > 0
                    ? `<tr>
                  <td style="padding: 4px 0; color: #059669;">Promo Discount (${data.couponCode || "COUPON"}):</td>
                  <td align="right" style="padding: 4px 0; font-weight: 700; color: #059669;">-${formatMoney(data.discountMinor)}</td>
                </tr>`
                    : ""
                }
                <tr>
                  <td style="padding: 4px 0; color: #6b7280;">Delivery (Lagos & Abuja Express):</td>
                  <td align="right" style="padding: 4px 0; font-weight: 600; color: #111827;">
                    ${data.shippingMinor === 0 ? "FREE" : formatMoney(data.shippingMinor)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0 0 0; border-top: 2px solid #e5e7eb; font-size: 16px; font-weight: 800; color: #111827;">Total Paid:</td>
                  <td align="right" style="padding: 12px 0 0 0; border-top: 2px solid #e5e7eb; font-size: 18px; font-weight: 800; color: #111827;">${formatMoney(data.totalMinor)}</td>
                </tr>
              </table>

              <!-- Delivery Address Box -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; margin-bottom: 28px;">
                <h4 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">
                  Shipping Address
                </h4>
                <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.5;">
                  <strong>${data.shippingAddress.full_name}</strong><br>
                  ${data.shippingAddress.address_line1}<br>
                  ${data.shippingAddress.address_line2 ? `${data.shippingAddress.address_line2}<br>` : ""}
                  ${data.shippingAddress.city}, ${data.shippingAddress.state}, Nigeria<br>
                  Phone: ${data.shippingAddress.phone}
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${trackingUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
                  Track Your Order Online →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 24px 40px; text-align: center; font-size: 12px; color: #6b7280; line-height: 1.5;">
              <p style="margin: 0 0 8px 0;">
                All products include 1-Year Official Manufacturer Warranty and 7-day fault return policy.
              </p>
              <p style="margin: 0;">
                Need help? Contact us anytime at <a href="mailto:support@slurge.ng" style="color: #2563eb; text-decoration: none;">support@slurge.ng</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  // Plain-text equivalent
  const text = `
SLURGE ELECTRONICS — ORDER CONFIRMATION
=======================================

Hello ${data.customerName},

Thank you for your order! Your payment has been verified and our team is preparing your package.

Reference: ${data.paymentReference || data.orderId}
Status: Paid & Processing

ITEMS ORDERED:
${data.items.map((i) => `- ${i.name} (Qty: ${i.quantity}) — ${formatMoney(i.lineTotalMinor)}`).join("\n")}

Subtotal: ${formatMoney(data.subtotalMinor)}
${data.discountMinor > 0 ? `Discount: -${formatMoney(data.discountMinor)}\n` : ""}Shipping: ${data.shippingMinor === 0 ? "FREE" : formatMoney(data.shippingMinor)}
Total Paid: ${formatMoney(data.totalMinor)}

SHIPPING TO:
${data.shippingAddress.full_name}
${data.shippingAddress.address_line1}
${data.shippingAddress.city}, ${data.shippingAddress.state}
Phone: ${data.shippingAddress.phone}

Track your order: ${trackingUrl}

Support: support@slurge.ng
  `.trim();

  return { html, text };
}
