"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "./types";

interface CartStoreState {
  items: CartItem[];
  isOpen: boolean;
  hasHydrated: boolean;
  isAuthenticated: boolean;
  freeShippingThresholdMinor: number;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  addItem: (
    item: Omit<CartItem, "quantity"> & { quantity?: number }
  ) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  setIsAuthenticated: (val: boolean) => void;
  setHasHydrated: (state: boolean) => void;
  setFreeShippingThresholdMinor: (minor: number) => void;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      hasHydrated: false,
      isAuthenticated: false,
      freeShippingThresholdMinor: 10000000, // ₦100,000 default (admin configurable)

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (newItem) => {
        const { items } = get();
        const existing = items.find((i) => i.variantId === newItem.variantId);
        const addQty = newItem.quantity || 1;

        if (existing) {
          const newQty = Math.min(
            existing.quantity + addQty,
            existing.maxStock
          );
          set({
            items: items.map((i) =>
              i.variantId === newItem.variantId
                ? { ...i, quantity: newQty }
                : i
            ),
            isOpen: true,
          });
        } else {
          const safeQty = Math.min(addQty, newItem.maxStock);
          if (safeQty > 0) {
            set({
              items: [...items, { ...newItem, quantity: safeQty }],
              isOpen: true,
            });
          }
        }
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        }));
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }

        set((state) => ({
          items: state.items.map((i) => {
            if (i.variantId === variantId) {
              const safeQty = Math.min(quantity, i.maxStock);
              return { ...i, quantity: safeQty };
            }
            return i;
          }),
        }));
      },

      clearCart: () => {
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("slurge_guest_cart");
            localStorage.removeItem("splug_guest_cart");
          } catch {
            // ignore
          }
        }
        set({ items: [] });
      },
      setItems: (items) => set({ items }),
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setHasHydrated: (state) => set({ hasHydrated: state }),
      setFreeShippingThresholdMinor: (minor) =>
        set({ freeShippingThresholdMinor: Math.max(0, minor) }),
    }),
    {
      name: "slurge_guest_cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        // AGENTS.md §12: Guest cart persists in localStorage. Authenticated cart is canonical in Supabase.
        if (state.isAuthenticated) {
          return {
            items: [],
            freeShippingThresholdMinor: state.freeShippingThresholdMinor,
          };
        }
        return {
          items: state.items,
          freeShippingThresholdMinor: state.freeShippingThresholdMinor,
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
