"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./validation";

export interface AuthActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Sign in with email and password
 */
export async function signInAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = signInSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please correct the errors in the form.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Return user-friendly error without leaking sensitive internals
    if (error.message.toLowerCase().includes("invalid login credentials")) {
      return {
        success: false,
        error: "Incorrect email or password. Please try again.",
      };
    }
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return {
        success: false,
        error: "Please confirm your email address before signing in.",
      };
    }
    return {
      success: false,
      error: "Unable to sign in. Please verify your details and try again.",
    };
  }

  revalidatePath("/", "layout");

  const redirectTo = (formData.get("redirectTo") as string) || "/account";
  // Safe redirect — prevent open redirect vulnerabilities
  const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/account";
  redirect(safeRedirect);
}

/**
 * Register a new customer account
 */
export async function signUpAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = signUpSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please correct the errors in the form.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("user already registered")) {
      return {
        success: false,
        error: "An account with this email address already exists.",
      };
    }
    return {
      success: false,
      error: "Unable to create account. Please try again later.",
    };
  }

  revalidatePath("/", "layout");

  // If email confirmation is required by Supabase project settings
  if (data.user && !data.session) {
    return {
      success: true,
      error: "Account created! Please check your email to confirm your account.",
    };
  }

  redirect("/account");
}

/**
 * Sign out the current user
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/sign-in");
}

/**
 * Request a password reset link
 */
export async function forgotPasswordAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get("email"),
  };

  const parsed = forgotPasswordSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please enter a valid email address.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const origin =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    }
  );

  if (error) {
    return {
      success: false,
      error: "Unable to send reset email. Please try again.",
    };
  }

  return {
    success: true,
  };
}

/**
 * Reset password with a new one
 */
export async function resetPasswordAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = resetPasswordSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please provide a valid matching password.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      success: false,
      error: "Failed to update password. Your reset link may have expired.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/sign-in?reset=success");
}

/**
 * Update user profile details
 */
export async function updateProfileAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const displayName = formData.get("displayName") as string;
  const phone = formData.get("phone") as string;

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName?.trim() || null,
      phone: phone?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/account", "layout");
  return { success: true };
}
