"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/cart/store";
import { mergeCartOnLoginAction } from "@/lib/cart/actions";

export function CartSync() {
  const syncedUserRef = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const syncCart = async (userId: string) => {
      if (syncedUserRef.current === userId) return;
      syncedUserRef.current = userId;

      const localItems = useCartStore.getState().items;
      try {
        // Merge guest items with database cart items on login
        const canonicalItems = await mergeCartOnLoginAction(localItems);
        useCartStore.getState().setItems(canonicalItems);
      } catch (err) {
        console.error("Failed to sync cart on login:", err);
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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
