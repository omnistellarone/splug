"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WishlistStoreState {
  productIds: string[];
  hasHydrated: boolean;
  toggleItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useWishlistStore = create<WishlistStoreState>()(
  persist(
    (set, get) => ({
      productIds: [],
      hasHydrated: false,

      toggleItem: (productId) => {
        const { productIds } = get();
        if (productIds.includes(productId)) {
          set({ productIds: productIds.filter((id) => id !== productId) });
        } else {
          set({ productIds: [...productIds, productId] });
        }
      },

      hasItem: (productId) => {
        return get().productIds.includes(productId);
      },

      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: "slurge_guest_wishlist",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
