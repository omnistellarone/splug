import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * SecureStore adapter for mobile session persistence
 */
const ExpoSecureStoreAdapter = {
  getItem: (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === "web") {
        return Promise.resolve(typeof localStorage !== "undefined" ? localStorage.getItem(key) : null);
      }
      return SecureStore.getItemAsync(key);
    } catch {
      return Promise.resolve(null);
    }
  },
  setItem: (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === "web") {
        if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
        return Promise.resolve();
      }
      return SecureStore.setItemAsync(key, value);
    } catch {
      return Promise.resolve();
    }
  },
  removeItem: (key: string): Promise<void> => {
    try {
      if (Platform.OS === "web") {
        if (typeof localStorage !== "undefined") localStorage.removeItem(key);
        return Promise.resolve();
      }
      return SecureStore.deleteItemAsync(key);
    } catch {
      return Promise.resolve();
    }
  },
};

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || "https://qnjrvsigzdkazghsqfjr.supabase.co";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuanJ2c2lnemRrYXpnaHNxZmpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NjQyOTMsImV4cCI6MjEwNjQ0MDI5M30.uOZr1k2mRNAzRv75LvX0gmkcelSrpbWLCqkTt_MIjVQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
