import { create } from "zustand";
import { StorageUtil } from "../utils/storage";

interface DeliveryState {
  pincode: string | null;

  setPincode: (pincode: string) => Promise<void>;
  clearPincode: () => Promise<void>;
  hydratePincode: () => Promise<void>;
}

export const useDeliveryStore = create<DeliveryState>((set) => ({
  pincode: null,

  // ✅ SET + STORE
  setPincode: async (pincode) => {
    await StorageUtil.setPincode(pincode);
    set({ pincode });
  },

  // ✅ CLEAR
  clearPincode: async () => {
    await StorageUtil.clearPincode();
    set({ pincode: null });
  },

  // ✅ LOAD FROM STORAGE
  hydratePincode: async () => {
    const saved = await StorageUtil.getPincode();

    if (saved) {
      set({ pincode: saved });
    }
  },
}));
