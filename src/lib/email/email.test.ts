import { describe, it, expect } from "vitest";
import { renderOrderConfirmationEmail } from "./templates/order-confirmation";
import { renderOrderStatusEmail } from "./templates/order-status";
import type { OrderEmailData } from "./types";

describe("Phase 6: Mailgun Email Service & Templates", () => {
  const sampleOrder: OrderEmailData = {
    orderId: "ord_1001_test_uuid",
    orderNumber: "ORD-1001",
    customerEmail: "babatunde@example.com",
    customerName: "Babatunde Adeleke",
    status: "paid",
    subtotalMinor: 95000000, // ₦950,000
    shippingMinor: 0, // Free shipping
    discountMinor: 2000000, // ₦20,000 promo discount
    totalMinor: 93000000, // ₦930,000
    couponCode: "WELCOME10",
    paymentReference: "slurge_ref_1727800000000_abc123",
    paidAt: "2026-10-01T12:00:00Z",
    shippingAddress: {
      full_name: "Babatunde Adeleke",
      phone: "08012345678",
      address_line1: "14 Admiralty Way",
      address_line2: "Flat 2A",
      city: "Lekki Phase 1",
      state: "Lagos",
      country: "NG",
    },
    items: [
      {
        name: "iPhone 16 Pro Max",
        variantName: "256GB • Natural Titanium",
        sku: "IPH16PM-256-NAT",
        quantity: 1,
        unitPriceMinor: 95000000,
        lineTotalMinor: 95000000,
      },
    ],
  };

  describe("Order Confirmation Email Template", () => {
    it("renders valid HTML with recipient name, order reference, and items", () => {
      const { html, text } = renderOrderConfirmationEmail(
        sampleOrder,
        "https://slurge.ng"
      );

      // Verify recipient and branding
      expect(html).toContain("Hello Babatunde Adeleke,");
      expect(html).toContain("Slurge");
      expect(html).toContain("Payment Verified & Order Confirmed");

      // Verify reference and money formatting
      expect(html).toContain("slurge_ref_1727800000000_abc123");
      expect(html).toContain("₦930,000"); // Formatted total
      expect(html).toContain("FREE"); // Free shipping
      expect(html).toContain("WELCOME10"); // Coupon discount

      // Verify item details
      expect(html).toContain("iPhone 16 Pro Max");
      expect(html).toContain("256GB • Natural Titanium");

      // Verify plain text version
      expect(text).toContain("SLURGE ELECTRONICS — ORDER CONFIRMATION");
      expect(text).toContain("Hello Babatunde Adeleke,");
      expect(text).toContain("iPhone 16 Pro Max");
      expect(text).toContain("₦930,000");
    });

    it("displays delivery fee when shipping is not free", () => {
      const paidShippingOrder = {
        ...sampleOrder,
        subtotalMinor: 5000000, // ₦50,000
        shippingMinor: 350000, // ₦3,500
        discountMinor: 0,
        totalMinor: 5350000,
      };

      const { html, text } = renderOrderConfirmationEmail(paidShippingOrder);
      expect(html).toContain("₦3,500");
      expect(text).toContain("₦3,500");
    });
  });

  describe("Order Status Email Template", () => {
    it("renders shipped status with tracking info", () => {
      const { html, text, subject } = renderOrderStatusEmail(
        sampleOrder,
        "shipped",
        "Dispatched via GIG Logistics tracking #GIG-998877"
      );

      expect(subject).toContain("Order Dispatched & On the Way!");
      expect(html).toContain("Order Dispatched & On the Way!");
      expect(html).toContain("GIG-998877");
      expect(text).toContain("Dispatched via GIG Logistics");
      expect(html).toContain("Lekki Phase 1, Lagos");
    });

    it("renders delivered status with active warranty reminder", () => {
      const { html, subject } = renderOrderStatusEmail(
        sampleOrder,
        "delivered"
      );

      expect(subject).toContain("Order Delivered Successfully!");
      expect(html).toContain("Your 1-year warranty is active");
    });

    it("renders cancelled status cleanly", () => {
      const { html, subject } = renderOrderStatusEmail(
        sampleOrder,
        "cancelled"
      );

      expect(subject).toContain("Order Cancelled");
      expect(html).toContain("Your order has been cancelled");
    });
  });

  describe("Welcome & Activation Email Template", () => {
    it("renders welcome email with user name and activation URL", async () => {
      const { renderWelcomeActivationEmail } = await import(
        "./templates/welcome-activation"
      );

      const { html, text, subject } = renderWelcomeActivationEmail({
        email: "chioma@example.com",
        fullName: "Chioma Okonjo",
        activationUrl: "https://slurge.ng/auth/activate?token=test1234",
      });

      expect(subject).toContain("Welcome to Slurge Electronics");
      expect(html).toContain("Chioma Okonjo");
      expect(html).toContain("https://slurge.ng/auth/activate?token=test1234");
      expect(html).toContain("100% Genuine Devices");
      expect(text).toContain("Chioma Okonjo");
      expect(text).toContain("https://slurge.ng/auth/activate?token=test1234");
    });
  });
});
