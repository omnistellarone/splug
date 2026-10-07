"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/cart/store";
import {
  getDatabaseCartAction,
  mergeCartOnLoginAction,
  syncCartToDatabaseAction,
} from "@/lib/cart/actions";
import { getStoreSettingsAction } from "@/lib/settings/actions";
import type { CartItem } from "@/lib/cart/types";

export function CartSync() {
  const currentUserIdRef = useRef<string | null>(null);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

    // 1. Fetch store settings and set dynamic threshold
    getStoreSettingsAction().then((settings) => {
      if (settings?.freeShippingThresholdMinor) {
        useCartStore
          .getState()
          .setFreeShippingThresholdMinor(settings.freeShippingThresholdMinor);
      }
    });

    // Helper: fetch canonical cart from database and update store without triggers
    const loadCanonicalCart = async () => {
      try {
        isSyncingRef.current = true;
        const dbItems = await getDatabaseCartAction();
        if (dbItems !== null) {
          useCartStore.getState().setItems(dbItems);
        }
      } catch (err) {
        console.error("Failed to load canonical cart:", err);
      } finally {
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 150);
      }
    };

    // Helper: handle user sign in and guest cart merge
    const handleUserSession = async (userId: string, isFreshLogin: boolean) => {
      const isUserChange = currentUserIdRef.current !== userId;
      currentUserIdRef.current = userId;
      useCartStore.getState().setIsAuthenticated(true);

      // Setup Realtime listener for this user
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
      realtimeChannel = supabase
        .channel(`user-cart-sync-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "cart_items",
            filter: `user_id=eq.${userId}`,
          },
          () => {
            if (!isSyncingRef.current) {
              loadCanonicalCart();
            }
          }
        )
        .subscribe();

      if (isFreshLogin || isUserChange) {
        // Read any guest items from localStorage
        let guestItems: CartItem[] = [];
        try {
          const raw = localStorage.getItem("slurge_guest_cart");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed?.state?.items) && parsed.state.items.length > 0) {
              guestItems = parsed.state.items;
            }
          }
        } catch {
          // ignore parsing error
        }

        // If there were guest items, merge them once and immediately clear localStorage
        if (guestItems.length > 0) {
          try {
            isSyncingRef.current = true;
            const canonicalItems = await mergeCartOnLoginAction(guestItems);
            useCartStore.getState().setItems(canonicalItems);
            localStorage.removeItem("slurge_guest_cart");
            return;
          } catch (err) {
            console.error("Failed to merge guest cart on login:", err);
          } finally {
            setTimeout(() => {
              isSyncingRef.current = false;
            }, 150);
          }
        }
      }

      // If already logged in (e.g. page refresh) or after merging, fetch canonical DB cart
      await loadCanonicalCart();
    };

    // Check current auth session on mount
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        handleUserSession(user.id, false);
      } else {
        useCartStore.getState().setIsAuthenticated(false);
      }
    });

    // Auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        handleUserSession(session.user.id, true);
      } else if (event === "SIGNED_OUT") {
        currentUserIdRef.current = null;
        if (realtimeChannel) {
          supabase.removeChannel(realtimeChannel);
          realtimeChannel = null;
        }
        useCartStore.getState().setIsAuthenticated(false);
        useCartStore.getState().clearCart();
      }
    });

    // 2. Synchronize in real-time when user switches back to this tab/window
    const onFocusOrVisible = () => {
      if (currentUserIdRef.current && !document.hidden && !isSyncingRef.current) {
        loadCanonicalCart();
      }
    };
    window.addEventListener("focus", onFocusOrVisible);
    document.addEventListener("visibilitychange", onFocusOrVisible);

    // 3. Keep database cart in sync whenever items change in this browser tab
    const unsubscribeStore = useCartStore.subscribe(async (state, prevState) => {
      if (!currentUserIdRef.current || isSyncingRef.current) return;
      if (state.items === prevState.items) return;

      try {
        isSyncingRef.current = true;
        await syncCartToDatabaseAction(state.items);
      } catch (err) {
        console.error("Failed to sync cart update to database:", err);
      } finally {
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 150);
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("focus", onFocusOrVisible);
      document.removeEventListener("visibilitychange", onFocusOrVisible);
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
      unsubscribeStore();
    };
  }, []);

  return null;
}
