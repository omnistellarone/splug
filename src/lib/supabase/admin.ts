/**
 * Supabase admin client — AGENTS.md §7
 *
 * Uses: service-role key — bypasses RLS intentionally.
 * SERVER-ONLY MODULE. Never import in Client Components.
 * Use only for operations that legitimately require bypassing RLS
 * (e.g., payment webhook finalization, admin mutations).
 */
import "server-only";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let adminClient: SupabaseClient<any, "public", any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createAdminClient(): SupabaseClient<any, "public", any> {
  if (adminClient) return adminClient;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Admin client cannot be created."
    );
  }

  adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  return adminClient;
}
