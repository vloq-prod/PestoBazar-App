import { create } from "zustand";
import { StorageUtil } from "../utils/storage";

interface AppState {
  // Visitor
  visitorId: string | null;
  token: string | null;

  // User
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  userAvatar: string | null;

  // Visitor actions
  setVisitor: (visitorId: string, token: string) => Promise<void>;
  clearVisitor: () => Promise<void>;
  hydrateVisitor: () => Promise<void>;

  // User actions
  setUser: (userId: string, userName: string, email?: string, avatar?: string) => Promise<void>;
  setGoogleUser: (userId: string, userName: string, email: string, avatar: string) => Promise<void>;
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
  userEmail: null,
  userAvatar: null,

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
  setUser: async (userId, userName, email, avatar) => {
    await StorageUtil.setUser(userId, userName, email, avatar);
    set({ userId, userName, userEmail: email, userAvatar: avatar });
  },

  setGoogleUser: async (userId, userName, email, avatar) => {
    await StorageUtil.setUser(userId, userName, email, avatar);
    set({ userId, userName, userEmail: email, userAvatar: avatar });
  },

  clearUser: async () => {
    await StorageUtil.clearUser();
    set({ userId: null, userName: null, userEmail: null, userAvatar: null });
  },

  hydrateUser: async () => {
    const userId = await StorageUtil.getUserId();
    const userName = await StorageUtil.getUserName();
    const email = await StorageUtil.getUserEmail();
    const avatar = await StorageUtil.getUserAvatar();
    if (userId && userName) {
      set({ userId, userName, userEmail: email, userAvatar: avatar });
    }
  },

  // ── Logout (clears everything) ────────────────────
  logout: async () => {
    await StorageUtil.clearUser();
    set({ userId: null, userName: null, userEmail: null, userAvatar: null });
  },
}));
