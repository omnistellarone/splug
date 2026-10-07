import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AppState } from "react-native";
import { api, CartItem, CartTotals } from "@/lib/api";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";
import * as SecureStore from "expo-secure-store";

const GUEST_CART_STORAGE_KEY = "slurge_guest_cart_v1";
const FREE_SHIPPING_THRESHOLD_MINOR = 10000000; // ₦100,000 (10,000,000 kobo)
const STANDARD_SHIPPING_MINOR = 350000; // ₦3,500

interface CartContextType {
  items: CartItem[];
  totals: CartTotals;
  shippingMinor: number;
  finalTotalMinor: number;
  couponCode: string;
  couponDiscountMinor: number;
  couponError: string | null;
  isLoading: boolean;
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeFromCart: (variantId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; error?: string }>;
  removeCoupon: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string>("");
  const [couponDiscountMinor, setCouponDiscountMinor] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Compute local totals
  const subtotalMinor = items.reduce((sum, item) => sum + item.priceMinor * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD_MINOR - subtotalMinor);
  const qualifiesForFreeShipping = subtotalMinor >= FREE_SHIPPING_THRESHOLD_MINOR;
  const shippingMinor = itemCount > 0 ? (qualifiesForFreeShipping ? 0 : STANDARD_SHIPPING_MINOR) : 0;
  const finalTotalMinor = Math.max(0, subtotalMinor - couponDiscountMinor + shippingMinor);

  const totals: CartTotals = {
    subtotalMinor,
    itemCount,
    freeShippingThresholdMinor: FREE_SHIPPING_THRESHOLD_MINOR,
    amountNeededForFreeShippingMinor: amountNeeded,
    qualifiesForFreeShipping,
  };

  const getUserCartStorageKey = (userId: string) => `slurge_user_cart_${userId}`;

  // Persist cart to local SecureStore (user-scoped if signed in, guest-scoped if not)
  const persistCart = async (newItems: CartItem[]) => {
    try {
      if (user?.id) {
        await SecureStore.setItemAsync(getUserCartStorageKey(user.id), JSON.stringify(newItems));
      } else {
        await SecureStore.setItemAsync(GUEST_CART_STORAGE_KEY, JSON.stringify(newItems));
      }
    } catch {
      // Ignore storage errors
    }
  };

  const refreshCart = useCallback(async () => {
    if (user?.id) {
      try {
        const res = await api.getCart();
        if (res.success && Array.isArray(res.data?.items)) {
          setItems(res.data.items);
          const userCacheKey = getUserCartStorageKey(user.id);
          await SecureStore.setItemAsync(userCacheKey, JSON.stringify(res.data.items));
        }
      } catch (err) {
        console.warn("Cart refresh failed:", err);
      }
    }
  }, [user?.id]);

  // 1. Initial cart load and synchronization
  useEffect(() => {
    let isCancelled = false;
    let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      if (user?.id) {
        setIsLoading(true);
        try {
          const userCacheKey = getUserCartStorageKey(user.id);

          // Step A: Immediately restore user-scoped local cache for instant UI
          const cachedJson = await SecureStore.getItemAsync(userCacheKey);
          let currentItems: CartItem[] = cachedJson ? JSON.parse(cachedJson) : [];

          if (currentItems.length > 0 && !isCancelled) {
            setItems(currentItems);
          }

          // Step B: Check for guest cart items added before signing in and merge
          const guestJson = await SecureStore.getItemAsync(GUEST_CART_STORAGE_KEY);
          const guestItems: CartItem[] = guestJson ? JSON.parse(guestJson) : [];

          if (guestItems.length > 0) {
            const mergeRes = await api.mergeCart(guestItems);
            if (mergeRes.success && mergeRes.data?.items) {
              currentItems = mergeRes.data.items;
              if (!isCancelled) setItems(currentItems);
              await SecureStore.setItemAsync(userCacheKey, JSON.stringify(currentItems));
              await SecureStore.deleteItemAsync(GUEST_CART_STORAGE_KEY);
              setIsLoading(false);
              return;
            }
          }

          // Step C: Fetch canonical cart from server or Supabase
          const res = await api.getCart();
          if (res.success && Array.isArray(res.data?.items)) {
            if (!isCancelled) setItems(res.data.items);
            await SecureStore.setItemAsync(userCacheKey, JSON.stringify(res.data.items));
          }
        } catch (err) {
          console.warn("Cart synchronization error:", err);
        } finally {
          if (!isCancelled) setIsLoading(false);
        }

        // Setup Realtime listener for this user
        realtimeChannel = supabase
          .channel(`mobile-cart-sync-${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "cart_items",
              filter: `user_id=eq.${user.id}`,
            },
            () => {
              refreshCart();
            }
          )
          .subscribe();
      } else {
        // User signed out: restore guest cart
        try {
          const guestJson = await SecureStore.getItemAsync(GUEST_CART_STORAGE_KEY);
          if (guestJson) {
            if (!isCancelled) setItems(JSON.parse(guestJson));
          } else {
            if (!isCancelled) setItems([]);
          }
        } catch {
          if (!isCancelled) setItems([]);
        }
      }
    })();

    // App state listener: refresh cart whenever user returns to the app
    const appStateSub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active" && user?.id) {
        refreshCart();
      }
    });

    return () => {
      isCancelled = true;
      appStateSub.remove();
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [user?.id, refreshCart]);

  const addToCart = async (item: Omit<CartItem, "quantity">, quantity: number = 1) => {
    const existingIndex = items.findIndex((i) => i.variantId === item.variantId);
    let updated: CartItem[];

    if (existingIndex > -1) {
      const current = items[existingIndex];
      const newQty = Math.min(current.quantity + quantity, item.maxStock);
      updated = [...items];
      updated[existingIndex] = { ...current, quantity: newQty };
    } else {
      const safeQty = Math.min(quantity, item.maxStock);
      updated = [...items, { ...item, quantity: safeQty }];
    }

    setItems(updated);
    await persistCart(updated);

    if (user) {
      const targetQty = updated.find((i) => i.variantId === item.variantId)?.quantity || quantity;
      await api.updateCartItem(item.variantId, targetQty);
    }
  };

  const updateQuantity = async (variantId: string, quantity: number) => {
    let updated: CartItem[];
    if (quantity <= 0) {
      updated = items.filter((i) => i.variantId !== variantId);
    } else {
      updated = items.map((i) => {
        if (i.variantId === variantId) {
          return { ...i, quantity: Math.min(quantity, i.maxStock) };
        }
        return i;
      });
    }

    setItems(updated);
    await persistCart(updated);

    if (user) {
      await api.updateCartItem(variantId, quantity);
    }
  };

  const removeFromCart = async (variantId: string) => {
    const updated = items.filter((i) => i.variantId !== variantId);
    setItems(updated);
    await persistCart(updated);

    if (user) {
      await api.removeCartItem(variantId);
    }
  };

  const clearCart = async () => {
    setItems([]);
    setCouponCode("");
    setCouponDiscountMinor(0);
    setCouponError(null);

    try {
      if (user?.id) {
        await SecureStore.deleteItemAsync(getUserCartStorageKey(user.id));
      }
      await SecureStore.deleteItemAsync(GUEST_CART_STORAGE_KEY);
    } catch {
      // Ignore
    }

    if (user) {
      await api.clearCart();
    }
  };

  const applyCoupon = async (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setCouponError("Please enter a coupon code");
      return { success: false, error: "Please enter a coupon code" };
    }

    setCouponError(null);
    const res = await api.validateCoupon(clean, subtotalMinor);

    if (res.success && res.data?.valid) {
      setCouponCode(clean);
      setCouponDiscountMinor(res.data.discountMinor || 0);
      return { success: true };
    } else {
      const err = res.data?.error || res.error || "Invalid coupon code";
      setCouponError(err);
      return { success: false, error: err };
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponDiscountMinor(0);
    setCouponError(null);
  };


  return (
    <CartContext.Provider
      value={{
        items,
        totals,
        shippingMinor,
        finalTotalMinor,
        couponCode,
        couponDiscountMinor,
        couponError,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};
