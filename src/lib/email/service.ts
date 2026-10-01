import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { renderOrderConfirmationEmail } from "./templates/order-confirmation";
import { renderOrderStatusEmail } from "./templates/order-status";
import type {
  SendEmailOptions,
  SendEmailResult,
  OrderEmailData,
} from "./types";

function getMailgunConfig() {
  const rawBase =
    process.env.MAILGUN_API_BASE_URL || "https://api.mailgun.net";
  const baseUrl = rawBase.endsWith("/v3")
    ? rawBase
    : `${rawBase.replace(/\/$/, "")}/v3`;

  const domain =
    process.env.MAILGUN_DOMAIN ||
    "sandbox8e0d3f313383466a9a0328e73e17a1e0.mailgun.org";

  return {
    apiKey: process.env.MAILGUN_API_KEY || null,
    domain,
    from:
      process.env.MAILGUN_FROM_EMAIL ||
      `Splug Electronics <mailgun@${domain}>`,
    baseUrl,
  };
}

/**
 * Log email events to Supabase for auditability and manual retry — AGENTS.md §17, §24
 */
async function recordEmailEvent(
  params: {
    recipient: string;
    templateKey: string;
    status: "sent" | "failed" | "simulated";
    providerMessageId?: string;
    errorMessage?: string;
    orderId?: string;
    userId?: string;
  }
) {
  try {
    const supabaseAdmin = createAdminClient();
    const tableRef = supabaseAdmin.from("email_events") as unknown as {
      insert: (record: Record<string, unknown>) => Promise<unknown>;
    };
    await tableRef.insert({
      recipient: params.recipient,
      template_key: params.templateKey,
      status: params.status,
      provider_message_id: params.providerMessageId || null,
      error_message: params.errorMessage || null,
      order_id: params.orderId || null,
      user_id: params.userId || null,
    });
  } catch (err) {
    // Audit logging failure should not abort the application flow
    console.warn("[Email Service] Failed to record email event in database:", err);
  }
}

/**
 * Core Mailgun HTTP API sending service — AGENTS.md §17
 *
 * Rules:
 * - Server-only.
 * - Does not expose API key.
 * - Never throw fatal errors that would cancel a paid order.
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  const { apiKey, domain, from, baseUrl } = getMailgunConfig();
  const recipient = Array.isArray(options.to) ? options.to.join(",") : options.to;

  // Safe fallback/simulation when Mailgun API key is not yet configured
  if (!apiKey || apiKey.startsWith("key-placeholder") || apiKey === "your_mailgun_api_key") {
    console.info(
      `[Mailgun Simulation] Email queued for ${recipient}: "${options.subject}" (${options.templateKey})`
    );

    const simMessageId = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    await recordEmailEvent({
      recipient,
      templateKey: options.templateKey,
      status: "simulated",
      providerMessageId: simMessageId,
      orderId: options.orderId,
      userId: options.userId,
    });

    return {
      success: true,
      simulated: true,
      messageId: simMessageId,
    };
  }

  try {
    const endpoint = `${baseUrl}/${domain}/messages`;
    const authHeader = `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`;

    const form = new URLSearchParams();
    form.append("from", from);
    form.append("to", recipient);
    form.append("subject", options.subject);
    form.append("html", options.html);
    if (options.text) {
      form.append("text", options.text);
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(
        `[Mailgun] Delivery error (${response.status}):`,
        errText
      );

      await recordEmailEvent({
        recipient,
        templateKey: options.templateKey,
        status: "failed",
        errorMessage: `HTTP ${response.status}: ${errText}`,
        orderId: options.orderId,
        userId: options.userId,
      });

      return {
        success: false,
        error: `Mailgun delivery failed with status ${response.status}`,
      };
    }

    const resData = (await response.json()) as { id?: string; message?: string };
    const messageId = resData.id || "mg_sent";

    await recordEmailEvent({
      recipient,
      templateKey: options.templateKey,
      status: "sent",
      providerMessageId: messageId,
      orderId: options.orderId,
      userId: options.userId,
    });

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("[Mailgun] Network/dispatch exception:", errorMsg);

    await recordEmailEvent({
      recipient,
      templateKey: options.templateKey,
      status: "failed",
      errorMessage: errorMsg,
      orderId: options.orderId,
      userId: options.userId,
    });

    // Preserve order integrity — do not re-throw
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Sends order confirmation receipt with itemized line items
 */
export async function sendOrderConfirmation(
  order: OrderEmailData
): Promise<SendEmailResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://splug.ng";
  const { html, text } = renderOrderConfirmationEmail(order, appUrl);

  const subject = `Order Confirmed: ${order.paymentReference || order.orderNumber} — Splug Electronics`;

  return sendEmail({
    to: order.customerEmail,
    subject,
    html,
    text,
    templateKey: "order-confirmation",
    orderId: order.orderId,
  });
}

/**
 * Sends order status change notification (processing, shipped, delivered, cancelled, refunded)
 */
export async function sendOrderStatusChanged(
  order: OrderEmailData,
  newStatus: "processing" | "shipped" | "delivered" | "cancelled" | "refunded",
  note?: string
): Promise<SendEmailResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://splug.ng";
  const { html, text, subject } = renderOrderStatusEmail(
    order,
    newStatus,
    note,
    appUrl
  );

  return sendEmail({
    to: order.customerEmail,
    subject,
    html,
    text,
    templateKey: `order-${newStatus}` as SendEmailOptions["templateKey"],
    orderId: order.orderId,
  });
}
