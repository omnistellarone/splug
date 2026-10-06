import { NextRequest } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

export interface AuthenticatedContext {
  user: User | null;
  supabase: SupabaseClient;
  token: string | null;
}

/**
 * Extracts authenticated user and creates an appropriately scoped Supabase client.
 * Supports BOTH:
 * 1. Mobile clients passing `Authorization: Bearer <token>`
 * 2. Web clients using Next.js cookie session
 */
export async function getAuthenticatedContext(
  request: NextRequest
): Promise<AuthenticatedContext> {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token) {
      const mobileClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      );

      const {
        data: { user },
        error,
      } = await mobileClient.auth.getUser(token);

      if (!error && user) {
        return { user, supabase: mobileClient, token };
      }
    }
  }

  // Fall back to cookie-based SSR client for web
  try {
    const cookieClient = await createServerClient();
    const {
      data: { user },
    } = await cookieClient.auth.getUser();

    return {
      user: user || null,
      supabase: cookieClient as unknown as SupabaseClient,
      token: null,
    };
  } catch (err) {
    console.error("[server-auth] Error creating cookie client:", err);
    const anonClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
    return { user: null, supabase: anonClient, token: null };
  }
}
