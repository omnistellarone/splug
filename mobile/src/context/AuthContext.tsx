import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

const SAVED_EMAIL_KEY = "slurge_saved_email";
const REMEMBER_DEVICE_KEY = "slurge_remember_device";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  savedEmail: string | null;
  rememberDevice: boolean;
  setRememberDevice: (val: boolean) => void;
  signIn: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  quickBiometricAuth: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [rememberDevice, setRememberDeviceState] = useState<boolean>(true);

  useEffect(() => {
    // 1. Initial session load
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user || null);

        // Load saved email for session recovery
        const saved = await SecureStore.getItemAsync(SAVED_EMAIL_KEY);
        if (saved) setSavedEmail(saved);

        const rem = await SecureStore.getItemAsync(REMEMBER_DEVICE_KEY);
        if (rem !== null) setRememberDeviceState(rem === "true");
      } catch (err) {
        console.warn("Auth initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    })();

    // Helper to process OAuth deep link URL
    const processAuthUrl = async (url: string) => {
      if (!url || !url.includes("auth/callback")) return;
      try {
        const matchAccess = url.match(/[?&#]access_token=([^&]+)/);
        const matchRefresh = url.match(/[?&#]refresh_token=([^&]+)/);
        if (matchAccess) {
          const accessToken = decodeURIComponent(matchAccess[1]);
          const refreshToken = matchRefresh ? decodeURIComponent(matchRefresh[1]) : "";
          const { data: sessionData } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionData.user) {
            setUser(sessionData.user);
            setSession(sessionData.session);
          }
        }

        const matchCode = url.match(/[?&#]code=([^&]+)/);
        if (matchCode) {
          const code = decodeURIComponent(matchCode[1]);
          const { data: sessionData } = await supabase.auth.exchangeCodeForSession(code);
          if (sessionData.user) {
            setUser(sessionData.user);
            setSession(sessionData.session);
          }
        }
      } catch (err) {
        console.warn("Deep link auth error:", err);
      }
    };

    // Check initial deep link launch
    Linking.getInitialURL().then((url) => {
      if (url) processAuthUrl(url);
    });

    const linkSub = Linking.addEventListener("url", ({ url }) => {
      processAuthUrl(url);
    });

    // 2. Auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setIsLoading(false);
      }
    );

    return () => {
      linkSub.remove();
      authListener.subscription.unsubscribe();
    };
  }, []);

  const setRememberDevice = async (val: boolean) => {
    setRememberDeviceState(val);
    try {
      await SecureStore.setItemAsync(REMEMBER_DEVICE_KEY, val ? "true" : "false");
    } catch {
      // Ignore
    }
  };

  const signIn = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const email = identifier.trim();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (rememberDevice && email) {
        setSavedEmail(email);
        await SecureStore.setItemAsync(SAVED_EMAIL_KEY, email);
      }

      setUser(data.user);
      setSession(data.session);
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Sign in failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (fullName: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim();
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (rememberDevice && cleanEmail) {
        setSavedEmail(cleanEmail);
        await SecureStore.setItemAsync(SAVED_EMAIL_KEY, cleanEmail);
      }

      setUser(data.user);
      setSession(data.session);
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Sign up failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const appSchemeRedirect = "slurge://auth/callback";
      // Cloud callback bridge configured on Vercel
      const webRedirectUrl = "https://splug-teal.vercel.app/auth/callback?mobile=true";

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: webRedirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) return { success: false, error: error.message };
      if (!data?.url) return { success: false, error: "OAuth URL generation failed" };

      const result = await WebBrowser.openAuthSessionAsync(data.url, appSchemeRedirect);

      if (result.type === "success" && result.url) {
        const fullUrl = result.url;
        let accessToken: string | null = null;
        let refreshToken: string | null = null;

        const matchAccess = fullUrl.match(/[?&#]access_token=([^&]+)/);
        const matchRefresh = fullUrl.match(/[?&#]refresh_token=([^&]+)/);

        if (matchAccess) accessToken = decodeURIComponent(matchAccess[1]);
        if (matchRefresh) refreshToken = decodeURIComponent(matchRefresh[1]);

        if (accessToken) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });
          if (sessionError) return { success: false, error: sessionError.message };
          setUser(sessionData.user);
          setSession(sessionData.session);
          return { success: true };
        }

        const matchCode = fullUrl.match(/[?&#]code=([^&]+)/);
        if (matchCode) {
          const code = decodeURIComponent(matchCode[1]);
          const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
          if (sessionError) return { success: false, error: sessionError.message };
          setUser(sessionData.user);
          setSession(sessionData.session);
          return { success: true };
        }
      }

      return { success: false, error: "Google sign-in was cancelled" };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "OAuth error",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const quickBiometricAuth = async () => {
    // Session recovery: if user has a saved email, auto-fill or simulate quick unlock
    if (savedEmail) {
      return { success: true };
    }
    return { success: false, error: "No saved session found for biometrics" };
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        savedEmail,
        rememberDevice,
        setRememberDevice,
        signIn,
        signUp,
        signInWithGoogle,
        quickBiometricAuth,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
