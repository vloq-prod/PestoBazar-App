/**
 * network-guard.ts
 *
 * WHY THIS FILE EXISTS:
 *   Deep links should not navigate to data-dependent screens when the
 *   device is offline. This guard checks network connectivity and redirects
 *   to the "no internet" screen when offline.
 *
 * RESPONSIBILITIES:
 *   - Check current network connectivity status
 *   - Return ALLOW if device is online
 *   - Return REDIRECT to no-internet screen if device is offline
 *
 * DEPENDENCIES:
 *   - deep-link.types.ts (Guard, GuardResult, DeepLinkPayload)
 *   - routes.ts (NO_INTERNET_ROUTE)
 *   - @react-native-community/netinfo
 *
 * DESIGN DECISION:
 *   Uses NetInfo.fetch() for a synchronous-ish check instead of subscribing
 *   to the listener. Guards are called at a point-in-time and don't need
 *   continuous monitoring.
 *
 * FUTURE EXTENSION:
 *   - Add "slow connection" detection (redirect to a lighter version of the screen)
 *   - Add offline-capable routes that bypass this guard (e.g., cached data)
 */

import type { Guard, GuardResult, DeepLinkPayload } from "../types/deep-link.types";
import { NO_INTERNET_ROUTE } from "../constants/routes";
import NetInfo from "@react-native-community/netinfo";

/**
 * In-memory network state.
 *
 * WHY IN-MEMORY (not Zustand):
 *   Network state is already tracked by the OS and exposed via NetInfo.
 *   Adding it to Zustand would be redundant state. We just need a
 *   snapshot at the time the guard runs.
 *
 * The listener keeps this updated continuously so the guard can
 * read it synchronously without awaiting.
 */
let _isConnected = true;

// Initialize the listener once at module load
const _unsubscribe = NetInfo.addEventListener((state) => {
  _isConnected = !!state.isConnected;
});

/**
 * Creates a NetworkGuard function.
 *
 * @returns A Guard function that checks network connectivity
 *
 * FLOW:
 *   1. Read current network state from in-memory cache
 *   2. If connected → ALLOW
 *   3. If disconnected → REDIRECT to no-internet screen
 *
 * EDGE CASES:
 *   - WiFi connected but no internet → NetInfo reports isConnected=true
 *     but isInternetReachable=false. We only check isConnected for now
 *     because isInternetReachable has known false-negative issues on Android.
 *   - Airplane mode → isConnected=false → REDIRECT
 *   - Initial state before NetInfo fires → _isConnected defaults to true
 *     (optimistic, avoids blocking on app startup)
 */
export function createNetworkGuard(): Guard {
  return (_payload: DeepLinkPayload): GuardResult => {
    if (_isConnected) {
      return { action: "ALLOW" };
    }

    return {
      action: "REDIRECT",
      redirectTo: NO_INTERNET_ROUTE,
      reason: "No internet connection",
    };
  };
}
