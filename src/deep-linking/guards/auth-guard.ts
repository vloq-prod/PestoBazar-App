/**
 * auth-guard.ts
 *
 * WHY THIS FILE EXISTS:
 *   Protects authenticated routes from unauthorized access via deep links.
 *   When a user taps a deep link to an auth-required screen (e.g., orders,
 *   checkout) but isn't logged in, this guard blocks navigation and redirects
 *   to the login screen.
 *
 * RESPONSIBILITIES:
 *   - Check if the target route requires authentication
 *   - Check if the user is currently authenticated (has userId)
 *   - Return ALLOW if no auth needed or user is logged in
 *   - Return REDIRECT to login if auth is needed but user isn't logged in
 *
 * DEPENDENCIES:
 *   - deep-link.types.ts (Guard, GuardResult, DeepLinkPayload)
 *   - routes.ts (findRouteByName, LOGIN_ROUTE)
 *   - auth store (useAppVisitorStore — accessed via getState() for non-React usage)
 *
 * DESIGN DECISION:
 *   Uses `useAppVisitorStore.getState()` instead of hooks because guards
 *   are pure functions called outside of React component lifecycle.
 *   Zustand's getState() is synchronous and safe to call anywhere.
 *
 * FUTURE EXTENSION:
 *   - Add role-based access control (admin, seller, buyer)
 *   - Add permission-level guards (e.g., only verified users can review)
 */

import type { Guard, GuardResult, DeepLinkPayload } from "../types/deep-link.types";
import { findRouteByName, LOGIN_ROUTE } from "../constants/routes";
import { useAppVisitorStore } from "../../store/auth";

/**
 * Creates an AuthGuard function.
 *
 * WHY FACTORY FUNCTION (not direct export):
 *   The factory pattern allows future dependency injection (e.g., passing
 *   a custom auth checker for testing). For now, it reads from the Zustand store.
 *
 * @returns A Guard function that checks authentication
 *
 * FLOW:
 *   1. Look up route in registry
 *   2. If route not found or doesn't require auth → ALLOW
 *   3. Check userId from auth store
 *   4. If userId exists → ALLOW
 *   5. If no userId → REDIRECT to login
 *
 * EDGE CASES:
 *   - Unknown route (not in registry) → ALLOW (let the router handle 404)
 *   - Route requires auth but user has visitorId but no userId → REDIRECT
 *     (visitorId is for anonymous sessions, userId is for logged-in users)
 */
export function createAuthGuard(): Guard {
  return (payload: DeepLinkPayload): GuardResult => {
    const routeConfig = findRouteByName(payload.routeName);

    // If route is not in the registry, allow it through.
    // The navigation router will handle unknown routes with a fallback.
    if (!routeConfig) {
      return { action: "ALLOW" };
    }

    // If route doesn't require auth, allow it through
    if (!routeConfig.requiresAuth) {
      return { action: "ALLOW" };
    }

    // Check if user is authenticated
    const { userId } = useAppVisitorStore.getState();

    if (userId) {
      // User is logged in → allow
      return { action: "ALLOW" };
    }

    // User is NOT logged in but route requires auth → redirect to login
    return {
      action: "REDIRECT",
      redirectTo: LOGIN_ROUTE,
      reason: `Route "${payload.routeName}" requires authentication`,
    };
  };
}
