"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/cart/store";
import {
  mergeCartOnLoginAction,
  syncCartToDatabaseAction,
} from "@/lib/cart/actions";
import { getStoreSettingsAction } from "@/lib/settings/actions";

export function CartSync() {
  const syncedUserRef = useRef<string | null>(null);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();

    // 1. Fetch store settings and set dynamic threshold
    getStoreSettingsAction().then((settings) => {
      if (settings?.freeShippingThresholdMinor) {
        useCartStore
          .getState()
          .setFreeShippingThresholdMinor(settings.freeShippingThresholdMinor);
      }
    });

    // 2. Sync cart upon user identification
    const syncCart = async (userId: string) => {
      if (syncedUserRef.current === userId) return;
      syncedUserRef.current = userId;

      const localItems = useCartStore.getState().items;
      try {
        isSyncingRef.current = true;
        // Merge guest items with database cart items on login
        const canonicalItems = await mergeCartOnLoginAction(localItems);
        useCartStore.getState().setItems(canonicalItems);
      } catch (err) {
        console.error("Failed to sync cart on login:", err);
      } finally {
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 300);
      }
    };

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        syncCart(user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        syncCart(session.user.id);
      } else if (event === "SIGNED_OUT") {
        syncedUserRef.current = null;
        useCartStore.getState().clearCart();
      }
    });

    // 3. Keep database cart in sync whenever items change for a logged-in user
    const unsubscribeStore = useCartStore.subscribe(async (state, prevState) => {
      if (!syncedUserRef.current || isSyncingRef.current) return;
      if (state.items === prevState.items) return;

      try {
        isSyncingRef.current = true;
        await syncCartToDatabaseAction(state.items);
      } catch (err) {
        console.error("Failed to sync cart update to database:", err);
      } finally {
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 200);
      }
    });

    return () => {
      subscription.unsubscribe();
      unsubscribeStore();
    };
  }, []);

  return null;
}
