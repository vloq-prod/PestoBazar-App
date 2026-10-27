import { create } from "zustand";
import { StorageUtil } from "../utils/storage";
import { createVisitor } from "../api/auth.api";
import { resetAnalytics } from "../lib/analytics";

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
  ensureVisitor: () => Promise<void>;
  resetVisitor: () => Promise<string | null>;

  // User actions
  setUser: (
    userId: string,
    userName: string,
    email?: string,
    avatar?: string,
  ) => Promise<void>;
  setGoogleUser: (
    userId: string,
    userName: string,
    email: string,
    avatar: string,
  ) => Promise<void>;
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

  ensureVisitor: async () => {
    let visitorId = await StorageUtil.getVisitorId();
    let token = await StorageUtil.getToken();

    try {
      const res = await createVisitor({ visitor_id: visitorId || "" });
      if (res && res.visitor_id && res.token) {
        visitorId = res.visitor_id;
        token = res.token;
        await StorageUtil.setVisitor(visitorId, token);
      }
    } catch (error) {
      // If offline or request fails, keep whatever is in local storage
    }

    if (visitorId && token) {
      set({ visitorId, token });
    }
  },

  resetVisitor: async () => {
    await StorageUtil.clearVisitor();
    set({ visitorId: null, token: null });
    try {
      const res = await createVisitor({ visitor_id: "" });
      if (res && res.visitor_id && res.token) {
        await StorageUtil.setVisitor(res.visitor_id, res.token);
        set({ visitorId: res.visitor_id, token: res.token });
        return res.visitor_id;
      }
    } catch (e) {
      console.warn("Failed to reset visitor:", e);
    }
    return null;
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
    resetAnalytics();
    set({ userId: null, userName: null, userEmail: null, userAvatar: null });
  },
}));
