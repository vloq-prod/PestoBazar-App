/**
 * pending-navigation.store.ts
 *
 * WHY THIS FILE EXISTS:
 *   When a deep link targets an auth-required screen but the user isn't
 *   logged in, the navigation intent must be STORED so it can be resumed
 *   after login. This store persists the pending navigation using Zustand
 *   (for synchronous access) + SecureStore (for cold-start survival).
 *
 * RESPONSIBILITIES:
 *   - Store a pending navigation payload
 *   - Retrieve and clear the pending navigation after login
 *   - Persist to SecureStore so it survives app kill
 *   - Auto-expire stale pending navigations (30 min default)
 *
 * DEPENDENCIES:
 *   - deep-link.types.ts (DeepLinkPayload, PendingNavigation)
 *   - guards.ts (PENDING_NAVIGATION_MAX_AGE_MS)
 *   - expo-secure-store
 *
 * STATE MANAGEMENT STRATEGY:
 *   Zustand is used (consistent with existing app pattern in src/store/auth.ts)
 *   instead of Context because:
 *     1. Context loses state on unmount (which happens during login flow)
 *     2. Zustand persists across component tree changes
 *     3. getState() works outside React (needed by the resolver)
 *
 *   SecureStore is used for persistence because:
 *     1. Survives app kill (cold start scenario)
 *     2. Already used in the app (src/utils/storage.ts)
 *     3. Secure storage prevents tampering
 *
 * FUTURE EXTENSION:
 *   - Add multiple pending navigations queue (for batch deep links)
 *   - Add pending navigation analytics (how often are pending navs used?)
 */

import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import type { DeepLinkPayload, PendingNavigation } from "../types/deep-link.types";
import { PENDING_NAVIGATION_MAX_AGE_MS } from "../constants/guards";

// ─── Storage Key ───────────────────────────────────────────────────────────────

const PENDING_NAV_STORAGE_KEY = "deep_link_pending_navigation" as const;

// ─── Store Interface ───────────────────────────────────────────────────────────

interface PendingNavigationState {
  /** The currently stored pending navigation, or null if none */
  pending: PendingNavigation | null;

  /**
   * Stores a deep link payload as a pending navigation.
   * Called by the resolver when auth guard blocks.
   */
  setPending: (payload: DeepLinkPayload) => Promise<void>;

  /**
   * Retrieves and clears the pending navigation.
   * Called by usePendingNavigation hook after login.
   * Returns null if no pending nav or if it has expired.
   */
  consumePending: () => Promise<DeepLinkPayload | null>;

  /**
   * Clears the pending navigation without consuming it.
   * Called on explicit logout or when the user navigates away.
   */
  clearPending: () => Promise<void>;

  /**
   * Hydrates the store from SecureStore on app startup.
   * Called once during app initialization to recover cold-start pending navs.
   */
  hydrate: () => Promise<void>;
}

// ─── Store Implementation ──────────────────────────────────────────────────────

export const usePendingNavigationStore = create<PendingNavigationState>((set, get) => ({
  pending: null,

  setPending: async (payload: DeepLinkPayload) => {
    const pendingNav: PendingNavigation = {
      payload,
      storedAt: Date.now(),
      maxAge: PENDING_NAVIGATION_MAX_AGE_MS,
    };

    set({ pending: pendingNav });

    // Persist to SecureStore for cold-start recovery
    try {
      await SecureStore.setItemAsync(
        PENDING_NAV_STORAGE_KEY,
        JSON.stringify(pendingNav),
      );
    } catch (error) {
    }
  },

  consumePending: async () => {
    const { pending } = get();

    if (!pending) return null;

    // Check expiry
    const age = Date.now() - pending.storedAt;
    if (age > pending.maxAge) {
      await get().clearPending();
      return null;
    }

    // Consume: return the payload and clear the store
    const payload = pending.payload;
    await get().clearPending();

    return payload;
  },

  clearPending: async () => {
    set({ pending: null });

    try {
      await SecureStore.deleteItemAsync(PENDING_NAV_STORAGE_KEY);
    } catch (error) {
    }
  },

  hydrate: async () => {
    try {
      const stored = await SecureStore.getItemAsync(PENDING_NAV_STORAGE_KEY);

      if (!stored) return;

      const pendingNav: PendingNavigation = JSON.parse(stored);

      // Check expiry during hydration
      const age = Date.now() - pendingNav.storedAt;
      if (age > pendingNav.maxAge) {
        await SecureStore.deleteItemAsync(PENDING_NAV_STORAGE_KEY);
        return;
      }

      set({ pending: pendingNav });
    } catch (error) {
      // Don't crash — just start with no pending nav
    }
  },
}));
