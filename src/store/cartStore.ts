import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CartState {
  items: Record<number, number>; // product_id -> qty
  /** Ephemeral signal used when returning from Coupons to the existing Cart route. */
  couponSuccessCode: string | null;
  setCart: (items: { product_id: number; qty: number }[]) => void;
  updateQuantity: (productId: number, qty: number) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  getQuantity: (productId: number) => number;
  setCouponSuccessCode: (code: string) => void;
  clearCouponSuccessCode: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: {},
      couponSuccessCode: null,

      setCart: (items) => {
        const mapped: Record<number, number> = {};
        if (Array.isArray(items)) {
          items.forEach((item) => {
            if (item && typeof item.product_id === "number") {
              mapped[item.product_id] = item.qty;
            }
          });
        }
        set({ items: mapped });
      },

      updateQuantity: (productId, qty) => {
        set((state) => {
          const nextItems = { ...state.items };
          if (qty <= 0) {
            delete nextItems[productId];
          } else {
            nextItems[productId] = qty;
          }
          return { items: nextItems };
        });
      },

      increaseQuantity: (productId) => {
        set((state) => {
          const nextItems = { ...state.items };
          nextItems[productId] = (nextItems[productId] ?? 0) + 1;
          return { items: nextItems };
        });
      },

      decreaseQuantity: (productId) => {
        set((state) => {
          const nextItems = { ...state.items };
          const current = nextItems[productId] ?? 0;
          if (current <= 1) {
            delete nextItems[productId];
          } else {
            nextItems[productId] = current - 1;
          }
          return { items: nextItems };
        });
      },

      removeItem: (productId) => {
        set((state) => {
          const nextItems = { ...state.items };
          delete nextItems[productId];
          return { items: nextItems };
        });
      },

      clearCart: () => {
        set({ items: {} });
      },

      getQuantity: (productId) => {
        return get().items[productId] ?? 0;
      },
      setCouponSuccessCode: (code) => set({ couponSuccessCode: code }),
      clearCouponSuccessCode: () => set({ couponSuccessCode: null }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // The success signal must not survive an app restart.
      partialize: (state) => ({ items: state.items }),
    }
  )
);
