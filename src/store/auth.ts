import { create } from "zustand";
import { StorageUtil } from "../utils/storage";

interface AppState {
  // Visitor
  visitorId: string | null;
  token: string | null;

  // User
  userId: string | null;
  userName: string | null;

  // Visitor actions
  setVisitor: (visitorId: string, token: string) => Promise<void>;
  clearVisitor: () => Promise<void>;
  hydrateVisitor: () => Promise<void>;

  // User actions
  setUser: (userId: string, userName: string) => Promise<void>;
  clearUser: () => Promise<void>;
  hydrateUser: () => Promise<void>;

  // Full logout
  logout: () => Promise<void>;
}

export const useAppVisitorStore = create<AppState>((set) => ({
  visitorId: null,
  token: null,
  userId: null,
  userName: null,

  // ── Visitor ──────────────────────────────────────
  setVisitor: async (visitorId, token) => {
    await StorageUtil.setVisitor(visitorId, token);
    set({ visitorId, token });
  },

  clearVisitor: async () => {
    await StorageUtil.clearVisitor();
    set({ visitorId: null, token: null });
  },

  hydrateVisitor: async () => {
    const visitorId = await StorageUtil.getVisitorId();
    const token = await StorageUtil.getToken();
    if (visitorId && token) set({ visitorId, token });
  },

  // ── User ─────────────────────────────────────────
  setUser: async (userId, userName) => {
    await StorageUtil.setUser(userId, userName);
    set({ userId, userName });
  },

  clearUser: async () => {
    await StorageUtil.clearUser();
    set({ userId: null, userName: null });
  },

  hydrateUser: async () => {
    const userId = await StorageUtil.getUserId();
    const userName = await StorageUtil.getUserName();
    if (userId && userName) set({ userId, userName });
  },

  // ── Logout (clears everything) ────────────────────
  logout: async () => {
    await StorageUtil.clearVisitor();
    await StorageUtil.clearUser();
    set({ visitorId: null, token: null, userId: null, userName: null });
  },
}));