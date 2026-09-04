/**
 * usePendingNavigation.ts
 *
 * WHY THIS FILE EXISTS:
 *   After a user completes login (triggered by an auth-guarded deep link),
 *   this hook automatically resumes the original navigation intent.
 *
 *   Without this hook, the user would log in and land on the home screen,
 *   losing the context of why they opened the app in the first place
 *   (e.g., they tapped a "View Order" push notification).
 *
 * RESPONSIBILITIES:
 *   - Watch for userId changes in the auth store
 *   - When userId appears (login), consume pending navigation
 *   - Resolve the pending navigation through the full pipeline
 *
 * DEPENDENCIES:
 *   - pending-navigation.store.ts (usePendingNavigationStore)
 *   - auth store (useAppVisitorStore)
 *   - deep-link-resolver.ts (resolvePayload)
 *
 * WHERE TO USE:
 *   Called ONCE in app/_layout.tsx (RootLayoutNav component),
 *   right next to useDeepLinking().
 *
 * DESIGN DECISIONS:
 *   - Watches userId specifically (not visitorId). WHY: visitorId is
 *     for anonymous sessions and exists before login. userId is the
 *     signal that login completed.
 *
 *   - Runs the full pipeline (resolvePayload) instead of navigating directly.
 *     WHY: The pending route still needs to pass guards (e.g., network guard).
 *     If the user logged in while offline, we shouldn't navigate to the order page.
 *
 * FUTURE EXTENSION:
 *   - Add a toast/snackbar that says "Resuming your previous action..."
 *   - Add timeout handling for very old pending navigations
 */

import { useEffect, useRef } from "react";
import { useAppVisitorStore } from "../../store/auth";
import { usePendingNavigationStore } from "../storage/pending-navigation.store";
import { resolvePayload } from "../resolver/deep-link-resolver";

/**
 * Hook that resumes pending navigation after login.
 *
 * FLOW:
 *   1. Watch userId from auth store
 *   2. When userId changes from null → non-null (login event)
 *   3. Check if there's a pending navigation
 *   4. If yes → resolve it through the pipeline
 *   5. If no → do nothing (normal login)
 *
 * EDGE CASES:
 *   - No pending navigation → hook is a no-op
 *   - Pending navigation expired → consumePending returns null
 *   - Multiple rapid userId changes → ref prevents double-processing
 *   - Pending navigation fails pipeline → falls back to home gracefully
 */
export function usePendingNavigation(): void {
  const userId = useAppVisitorStore((state) => state.userId);
  const prevUserId = useRef<string | null>(null);

  useEffect(() => {
    // Detect login event: userId was null, now it's not
    if (prevUserId.current === null && userId !== null) {
      handlePostLoginNavigation();
    }

    prevUserId.current = userId;
  }, [userId]);
}

/**
 * Consumes and resolves the pending navigation after login.
 *
 * BUSINESS LOGIC:
 *   Small delay (500ms) is added after login to ensure the navigation
 *   tree has fully mounted. Without this, router.push() may fail because
 *   the auth layout is still transitioning to the tabs layout.
 */
async function handlePostLoginNavigation(): Promise<void> {
  try {
    const payload = await usePendingNavigationStore.getState().consumePending();

    if (!payload) {
      return;
    }

    // Delay to ensure navigation tree is ready after layout transition
    setTimeout(() => {
      resolvePayload(payload);
    }, 500);
  } catch (error) {
  }
}
