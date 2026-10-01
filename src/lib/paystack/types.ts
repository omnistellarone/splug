/**
 * Paystack Integration Types — AGENTS.md §16
 * All monetary amounts are integer minor units (kobo).
 */

export interface PaystackInitializeParams {
  email: string;
  amountMinor: number;
  reference: string;
  callbackUrl?: string;
  metadata?: {
    order_id?: string;
    user_id?: string;
    customer_name?: string;
    custom_fields?: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
  channels?: string[];
}

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: "success" | "failed" | "abandoned" | "reversed";
    reference: string;
    amount: number; // in kobo
    currency: string;
    paid_at: string | null;
    channel: string;
    ip_address?: string;
    metadata?: {
      order_id?: string;
      user_id?: string;
      [key: string]: unknown;
    };
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
  };
}

export interface PaystackWebhookEvent {
  event: "charge.success" | "charge.failed" | string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number; // in kobo
    currency: string;
    paid_at: string;
    channel: string;
    metadata?: {
      order_id?: string;
      user_id?: string;
      [key: string]: unknown;
    };
    customer: {
      email: string;
      [key: string]: unknown;
    };
  };
}
