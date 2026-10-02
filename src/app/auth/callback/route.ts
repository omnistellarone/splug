import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/account";

  // Prevent open-redirect vulnerability: ensure relative URL starting with /
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/account";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
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
    }
  }

  // Auth exchange failed or code missing — redirect to sign-in with error param
  return NextResponse.redirect(
    new URL("/sign-in?error=auth_exchange_failed", requestUrl.origin)
  );
}
