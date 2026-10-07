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
      if (isExplicitMobile) {
        const mobileDeepLink = `slurge://auth/callback?access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}`;
        return NextResponse.redirect(mobileDeepLink);
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
