import { create } from "zustand";
import { StorageUtil } from "../utils/storage";

interface VisitorState {
  visitorId: string | null;
  token: string | null;

  setVisitor: (visitorId: string, token: string) => Promise<void>;
  clearVisitor: () => Promise<void>;
  hydrateVisitor: () => Promise<void>;
}

export const useAppVisitorStore = create<VisitorState>((set) => ({
  visitorId: null,
  token: null,

  // ✅ SET + PERSIST
  setVisitor: async (visitorId, token) => {
    await StorageUtil.setVisitor(visitorId, token);

    set({ visitorId, token });
  },

  // ✅ CLEAR + REMOVE
  clearVisitor: async () => {
    await StorageUtil.clearVisitor();

    set({ visitorId: null, token: null });
  },

  hydrateVisitor: async () => {
    const visitorId = await StorageUtil.getVisitorId();
    const token = await StorageUtil.getToken();

    if (visitorId && token) {
      set({ visitorId, token });
    }
  },
}));