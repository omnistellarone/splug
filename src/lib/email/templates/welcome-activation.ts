import type { WelcomeEmailData } from "../types";

export function renderWelcomeActivationEmail(
  data: WelcomeEmailData,
  appUrl: string = "https://slurge.ng"
): { html: string; text: string; subject: string } {
  const recipientName = data.fullName || "Tech Enthusiast";
  const activationUrl = data.activationUrl || `${appUrl}/login`;
  const subject = `Welcome to Slurge Electronics — Activate Your Account`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #09090b; padding: 36px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 30px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                Slurge<span style="color: #4f46e5;">.</span>
              </h1>
              <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 13px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;">
                Premium Electronics Flagship
              </p>
            </td>
          </tr>

          <!-- Welcome Banner -->
          <tr>
            <td style="padding: 36px 40px 16px 40px;">
              <div style="background-color: #eef2ff; border: 1px solid #c7d2fe; border-radius: 12px; padding: 18px 24px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 26px;">⚡</span>
                <h2 style="margin: 8px 0 0 0; font-size: 20px; font-weight: 800; color: #3730a3;">
                  Welcome to Slurge, ${recipientName}!
                </h2>
                <p style="margin: 6px 0 0 0; font-size: 14px; color: #4338ca;">
                  Your passport to certified, genuine tech and seamless shopping.
                </p>
              </div>

              <p style="font-size: 15px; line-height: 24px; color: #374151; margin: 0 0 16px 0;">
                Thank you for creating your account with <strong>Slurge Electronics</strong>. We are thrilled to have you join our community of tech lovers, gamers, and creators.
              </p>
              <p style="font-size: 15px; line-height: 24px; color: #374151; margin: 0 0 28px 0;">
                Please activate your account and verify your email address to unlock full member benefits, order tracking, and exclusive discounts.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <a href="${activationUrl}" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 10px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4); text-align: center;">
                      Verify & Activate Account &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Perks Section -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin-bottom: 28px;">
                <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a;">
                  Why shop with Slurge?
                </h3>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 22px; color: #475569;">
                  <li style="margin-bottom: 6px;"><strong>100% Genuine Devices:</strong> Brand-new Apple, Samsung, Sony, and more.</li>
                  <li style="margin-bottom: 6px;"><strong>1-Year Warranty:</strong> Full coverage on all hardware and tech purchases.</li>
                  <li style="margin-bottom: 6px;"><strong>Fast, Insured Shipping:</strong> Nationwide safe delivery right to your doorstep.</li>
                  <li><strong>Live Order Tracking:</strong> Track every milestone from order to dispatch in real-time.</li>
                </ul>
              </div>

              <!-- Button Link Fallback -->
              <p style="font-size: 12px; line-height: 18px; color: #9ca3af; margin: 0 0 24px 0;">
                If the button above doesn't work, copy and paste this URL into your browser:<br>
                <a href="${activationUrl}" style="color: #4f46e5; word-break: break-all;">${activationUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280;">
                Need assistance? Our 24/7 support is ready to help at
                <a href="mailto:support@slurge.ng" style="color: #4f46e5; text-decoration: none;">support@slurge.ng</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                &copy; ${new Date().getFullYear()} Slurge Electronics. All rights reserved.
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

  const text = `
Welcome to Slurge Electronics, ${recipientName}!

Thank you for creating an account with Slurge Electronics — your official electronics flagship for 100% genuine tech, Apple, Samsung, Sony, and certified accessories.

Please verify and activate your account by clicking the link below:
${activationUrl}

What you get with Slurge:
- 100% Genuine Products with 1-Year Warranty
- Fast Nationwide Insured Delivery
- Live Step-by-Step Order Milestone Tracking
- Secure Instant Payments via Paystack

Need assistance? Contact support@slurge.ng.
© ${new Date().getFullYear()} Slurge Electronics. All rights reserved.
  `.trim();

  return { html, text, subject };
}
