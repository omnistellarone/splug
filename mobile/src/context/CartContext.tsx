import React, { createContext, useContext, useEffect, useState } from "react";
import { api, CartItem, CartTotals } from "@/lib/api";
import { useAuth } from "./AuthContext";
import * as SecureStore from "expo-secure-store";

const GUEST_CART_STORAGE_KEY = "slurge_guest_cart_v1";
const FREE_SHIPPING_THRESHOLD_MINOR = 100000000; // ₦1,000,000
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

  // 1. Initial cart load / guest load
  useEffect(() => {
    (async () => {
      if (user) {
        setIsLoading(true);
        // Load existing guest items to merge
        try {
          const savedGuestJson = await SecureStore.getItemAsync(GUEST_CART_STORAGE_KEY);
          const guestItems: CartItem[] = savedGuestJson ? JSON.parse(savedGuestJson) : [];

          if (guestItems.length > 0) {
            const mergeRes = await api.mergeCart(guestItems);
            if (mergeRes.success && mergeRes.data?.items) {
              setItems(mergeRes.data.items);
              await SecureStore.deleteItemAsync(GUEST_CART_STORAGE_KEY);
              setIsLoading(false);
              return;
            }
          }

          // Fetch user cart
          const res = await api.getCart();
          if (res.success && res.data?.items) {
            setItems(res.data.items);
          }
        } catch (err) {
          console.warn("Cart fetch error:", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Load guest cart
        try {
          const savedGuestJson = await SecureStore.getItemAsync(GUEST_CART_STORAGE_KEY);
          if (savedGuestJson) {
            setItems(JSON.parse(savedGuestJson));
          }
        } catch {
          // Ignore
        }
      }
    })();
  }, [user]);

  // Persist guest cart locally when unauthenticated
  const persistGuestCart = async (newItems: CartItem[]) => {
    if (!user) {
      try {
        await SecureStore.setItemAsync(GUEST_CART_STORAGE_KEY, JSON.stringify(newItems));
      } catch {
        // Ignore
      }
    }
  };

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
    await persistGuestCart(updated);

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
    await persistGuestCart(updated);

    if (user) {
      await api.updateCartItem(variantId, quantity);
    }
  };

  const removeFromCart = async (variantId: string) => {
    const updated = items.filter((i) => i.variantId !== variantId);
    setItems(updated);
    await persistGuestCart(updated);

    if (user) {
      await api.removeCartItem(variantId);
    }
  };

  const clearCart = async () => {
    setItems([]);
    setCouponCode("");
    setCouponDiscountMinor(0);
    setCouponError(null);
    await persistGuestCart([]);

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

  const refreshCart = async () => {
    if (user) {
      setIsLoading(true);
      try {
        const res = await api.getCart();
        if (res.success && res.data?.items) {
          setItems(res.data.items);
        }
      } finally {
        setIsLoading(false);
      }
    }
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
