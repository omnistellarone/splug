/**
 * Supabase browser client — AGENTS.md §7
 *
 * Uses: public URL + publishable/anon key only.
 * Safe to use in Client Components.
 * RLS is enforced — service role is never included here.
 */
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
