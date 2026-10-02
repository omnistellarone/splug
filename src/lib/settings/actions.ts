"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface StoreSettings {
  freeShippingThresholdMinor: number;
  freeShippingEnabled: boolean;
  storeName: string;
  supportEmail: string;
  phone: string;
  currency: string;
}

const DEFAULT_SETTINGS: StoreSettings = {
  freeShippingThresholdMinor: 10000000, // ₦100,000 (10,000,000 kobo)
  freeShippingEnabled: true,
  storeName: "Slurge Electronics",
  supportEmail: "support@slurge.ng",
  phone: "+234 800 000 0000",
  currency: "NGN",
};

/**
 * Fetch global store settings with resilient fallbacks
 */
export async function getStoreSettingsAction(): Promise<StoreSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("store_settings")
      .select("key, value");

    if (error || !data) {
      return DEFAULT_SETTINGS;
    }

    const settingsMap: Record<string, unknown> = {};
    for (const row of data) {
      settingsMap[row.key] = row.value;
    }

    return {
      freeShippingThresholdMinor:
        typeof settingsMap.free_shipping_threshold_minor === "number"
          ? (settingsMap.free_shipping_threshold_minor as number)
          : DEFAULT_SETTINGS.freeShippingThresholdMinor,
      freeShippingEnabled:
        typeof settingsMap.free_shipping_enabled === "boolean"
          ? (settingsMap.free_shipping_enabled as boolean)
          : DEFAULT_SETTINGS.freeShippingEnabled,
      storeName:
        typeof settingsMap.store_name === "string"
          ? (settingsMap.store_name as string)
          : DEFAULT_SETTINGS.storeName,
      supportEmail:
        typeof settingsMap.support_email === "string"
          ? (settingsMap.support_email as string)
          : DEFAULT_SETTINGS.supportEmail,
      phone:
        typeof settingsMap.phone === "string"
          ? (settingsMap.phone as string)
          : DEFAULT_SETTINGS.phone,
      currency: "NGN",
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update free delivery threshold (Admin only)
 * Input is in standard Naira (e.g. 50000 for ₦50,000), stored as minor kobo units
 */
export async function updateFreeShippingThresholdAction(
  thresholdNaira: number
): Promise<{ success: boolean; error?: string; thresholdMinor?: number }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return { success: false, error: "Forbidden: Admin access required" };
    }

    const thresholdMinor = Math.max(0, Math.round(thresholdNaira * 100));

    const { error } = await supabase.from("store_settings").upsert(
      {
        key: "free_shipping_threshold_minor",
        value: thresholdMinor,
        description: `Free delivery threshold set by admin: ₦${thresholdNaira.toLocaleString()}`,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/settings");
    revalidatePath("/cart");
    revalidatePath("/");

    return { success: true, thresholdMinor };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update threshold";
    return { success: false, error: message };
  }
}
