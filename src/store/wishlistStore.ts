// src/store/wishlistStore.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface WishlistState {
  wishlistIds: Record<number, boolean>;
  count: number;
  setWishlist: (
    items: Array<{ product_id: number }>,
    serverCount?: number
  ) => void;
  toggleWishlist: (productId: number) => boolean;
  setWishlisted: (productId: number, isWishlisted: boolean, count?: number) => void;
  isWishlisted: (productId: number) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistIds: {},
      count: 0,

      setWishlist: (items, serverCount) => {
        const mapped: Record<number, boolean> = {};
        if (Array.isArray(items)) {
          items.forEach((item) => {
            if (item && typeof item.product_id === "number") {
              mapped[item.product_id] = true;
            }
          });
        }
        const calculatedCount = Object.keys(mapped).length;
        set({
          wishlistIds: mapped,
          count: typeof serverCount === "number" ? serverCount : calculatedCount,
        });
      },

      toggleWishlist: (productId: number) => {
        const state = get();
        const currentlyWishlisted = Boolean(state.wishlistIds[productId]);
        const nextWishlisted = !currentlyWishlisted;
        const nextMap = { ...state.wishlistIds };

        if (nextWishlisted) {
          nextMap[productId] = true;
        } else {
          delete nextMap[productId];
        }

        const nextCount = Math.max(
          0,
          state.count + (nextWishlisted ? 1 : -1)
        );

        set({
          wishlistIds: nextMap,
          count: nextCount,
        });

        return nextWishlisted;
      },

      setWishlisted: (productId: number, isWishlisted: boolean, count?: number) => {
        set((state) => {
          const nextMap = { ...state.wishlistIds };
          const wasWishlisted = Boolean(nextMap[productId]);

          if (isWishlisted) {
            nextMap[productId] = true;
          } else {
            delete nextMap[productId];
          }

          let nextCount = state.count;
          if (typeof count === "number") {
            nextCount = count;
          } else if (isWishlisted && !wasWishlisted) {
            nextCount = state.count + 1;
          } else if (!isWishlisted && wasWishlisted) {
            nextCount = Math.max(0, state.count - 1);
          }

          return {
            wishlistIds: nextMap,
            count: nextCount,
          };
        });
      },

      isWishlisted: (productId: number) => {
        return Boolean(get().wishlistIds[productId]);
      },

      clearWishlist: () => {
        set({ wishlistIds: {}, count: 0 });
      },
    }),
    {
      name: "wishlist-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        wishlistIds: state.wishlistIds,
        count: state.count,
      }),
    }
  )
);
