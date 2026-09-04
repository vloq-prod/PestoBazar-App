/**
 * useDeepLinking.ts
 *
 * WHY THIS FILE EXISTS:
 *   The main React hook that wires the deep linking engine to the React
 *   component lifecycle. It handles three critical scenarios:
 *
 *   1. COLD START: App was killed, user taps a deep link → app opens
 *      with the URL. We read it via Linking.getInitialURL().
 *
 *   2. WARM START / FOREGROUND: App is already running, user taps a deep link
 *      in a browser or notification. We catch it via Linking.addEventListener().
 *
 *   3. ROUTER READINESS: Sets the Expo Router reference so the navigation
 *      router can execute navigations.
 *
 * RESPONSIBILITIES:
 *   - Set up Expo Linking listener for incoming URLs
 *   - Handle initial URL on cold start
 *   - Register Expo Router instance with the navigation router
 *   - Hydrate pending navigation store on startup
 *   - Clean up listeners on unmount
 *
 * DEPENDENCIES:
 *   - expo-linking (Linking)
 *   - expo-router (useRouter)
 *   - deep-link-resolver.ts (resolveUrl)
 *   - navigation-router.ts (setRouter)
 *   - pending-navigation.store.ts (usePendingNavigationStore)
 *
 * WHERE TO USE:
 *   Called ONCE in app/_layout.tsx (RootLayoutNav component).
 *   Must be inside the Expo Router <Stack> tree so useRouter() works.
 *
 * DESIGN DECISIONS:
 *   - Runs AFTER app hydration (isReady flag). WHY: Deep links that
 *     arrive before the auth store is hydrated would cause incorrect
 *     guard decisions. We wait for isReady to ensure accurate auth checks.
 *
 *   - Uses expo-linking (not expo-router's useURL). WHY: expo-linking
 *     gives us both getInitialURL() and addEventListener(), which is
 *     everything we need. useURL() is a convenience hook but doesn't
 *     expose the initial URL for cold start.
 *
 * FUTURE EXTENSION:
 *   - Add deep link event logging for session tracking
 *   - Add deep link URL filtering (ignore certain URLs)
 */

import { useEffect, useRef } from "react";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { resolveUrl } from "../resolver/deep-link-resolver";
import { setRouter } from "../navigation/navigation-router";
import { usePendingNavigationStore } from "../storage/pending-navigation.store";

/**
 * Configuration options for the deep linking hook.
 */
interface UseDeepLinkingOptions {
  /**
   * Whether the app is ready (auth hydrated, splash done).
   * Deep links received before this is true will be ignored — they'll
   * be caught by getInitialURL() when isReady becomes true.
   */
  isReady: boolean;
}

/**
 * Main deep linking hook. Call once in app/_layout.tsx.
 *
 * @param options - Configuration object
 *
 * FLOW:
 *   1. On mount: Register router with navigation-router module
 *   2. On mount: Hydrate pending navigation store from SecureStore
 *   3. When isReady: Check for initial URL (cold start)
 *   4. When isReady: Set up Linking event listener (warm start)
 *   5. On unmount: Clean up listener
 *
 * EDGE CASES:
 *   - isReady toggles false→true only once per app lifecycle
 *   - Multiple URLs arriving rapidly → resolver handles deduplication
 *   - Initial URL might be the app's own scheme (e.g., from Expo Go) → ignored
 */
export function useDeepLinking({ isReady }: UseDeepLinkingOptions): void {
  const router = useRouter();
  const initialUrlHandled = useRef(false);

  // Step 1: Register router instance
  useEffect(() => {
    if (isReady) {
      setRouter(router);
    }
  }, [isReady, router]);

  // Step 2: Hydrate pending navigation store on mount
  useEffect(() => {
    usePendingNavigationStore.getState().hydrate();
  }, []);

  // Step 3 & 4: Handle deep links when ready
  useEffect(() => {
    if (!isReady) return;

    // ── Cold Start: Check initial URL ──────────────────────────────────────
    // getInitialURL() returns the URL that launched the app (if any).
    // This only applies to cold start — when the app was killed and opened
    // via a deep link.
    if (!initialUrlHandled.current) {
      initialUrlHandled.current = true;

      Linking.getInitialURL()
        .then((url) => {
          if (url) {
            resolveUrl(url);
          }
        })
        .catch(() => {});
    }

    // ── Warm Start: Listen for incoming URLs ────────────────────────────────
    // addEventListener fires when the app receives a URL while running
    // (foreground or background).
    const subscription = Linking.addEventListener("url", (event) => {
      if (event.url) {
        resolveUrl(event.url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isReady]);
}
