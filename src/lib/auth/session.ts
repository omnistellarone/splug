import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types/database";

export interface UserSessionData {
  user: {
    id: string;
    email?: string;
  } | null;
  profile: Profile | null;
  role: "admin" | "customer" | null;
  isAdmin: boolean;
}

export async function getCurrentUserSession(): Promise<UserSessionData> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      role: null,
      isAdmin: false,
    };
  }

  // Fetch profile and role in parallel
  const [profileResult, roleResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
  ]);

  const profile = profileResult.data as Profile | null;
  const roleRecord = roleResult.data as Pick<UserRole, "role"> | null;
  const role = roleRecord?.role ?? "customer";

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    profile,
    role,
    isAdmin: role === "admin",
  };
}

/**
 * Server-side guard that strictly verifies the caller is authenticated AND has the admin role.
 * Throws an error if unauthorized.
 * AGENTS.md §9.
 */
export async function requireAdminSession(): Promise<UserSessionData> {
  const session = await getCurrentUserSession();
  if (!session.user || !session.isAdmin) {
    throw new Error("Unauthorized: Admin privileges required.");
  }
  return session;
}
