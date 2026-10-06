import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  // Prevent open-redirect vulnerability: ensure relative URL starting with /
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const isExplicitMobile = requestUrl.searchParams.get("mobile") === "true" || next === "mobile";
  const userAgent = request.headers.get("user-agent") || "";
  const isMobileBrowser = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.session) {
      const mobileDeepLink = `slurge://auth/callback?access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}`;

      if (isExplicitMobile) {
        return NextResponse.redirect(mobileDeepLink);
      }

      // If user opened email verification or OAuth on a mobile device, launch the mobile app
      if (isMobileBrowser) {
        const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Slurge - Account Verified</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0b0f19; color: #ffffff; text-align: center; padding: 20px; }
    .card { background: #161f36; padding: 36px 24px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); max-width: 420px; width: 100%; border: 1px solid rgba(255,255,255,0.08); }
    .icon { width: 64px; height: 64px; background: #4f46e5; border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 32px; }
    h2 { margin: 0 0 10px; font-size: 22px; font-weight: 700; }
    p { margin: 0 0 24px; font-size: 14px; color: #94a3b8; line-height: 1.5; }
    .btn { display: block; width: 100%; padding: 15px 0; background: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; margin-bottom: 12px; }
    .btn-secondary { background: rgba(255,255,255,0.08); color: #94a3b8; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⚡</div>
    <h2>Account Verified!</h2>
    <p>Your Slurge account is ready. Tapping below will take you directly into the Slurge mobile shop.</p>
    <a id="open-app-btn" class="btn" href="${mobileDeepLink}">Open Slurge App</a>
    <a class="btn btn-secondary" href="${safeNext}">Continue in Browser</a>
  </div>
  <script>
    // Automatically trigger app deep link
    window.location.href = "${mobileDeepLink}";
  </script>
</body>
</html>`;
        return new NextResponse(html, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${safeNext}`);
      } else {
        return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
      }
    } else {
      console.error("Auth callback exchange error:", error);
      if (isExplicitMobile) {
        return NextResponse.redirect(
          `slurge://auth/callback?error=${encodeURIComponent(error?.message || "auth_exchange_failed")}`
        );
      }
    }
  }

  if (isExplicitMobile) {
    return NextResponse.redirect(
      "slurge://auth/callback?error=no_code_provided"
    );
  }

  // Auth exchange failed or code missing — redirect to sign-in with error param
  return NextResponse.redirect(
    new URL("/sign-in?error=auth_exchange_failed", requestUrl.origin)
  );
}
