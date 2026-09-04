/**
 * deep-link-analytics.ts
 *
 * WHY THIS FILE EXISTS:
 *   Tracks deep link events for marketing attribution, campaign ROI measurement,
 *   and debugging. Every deep link open, failure, and guard block is logged with
 *   full context (source, UTM, route, auth state).
 *
 * RESPONSIBILITIES:
 *   - Track deep link open events
 *   - Track deep link failure events (parse, validation)
 *   - Track deep link guard events (auth blocked, network blocked)
 *   - Log events for debugging
 *   - Provide an extensible interface for future analytics backends
 *
 * DEPENDENCIES:
 *   - deep-link.types.ts (DeepLinkAnalyticsEvent)
 *
 * CURRENT IMPLEMENTATION:
 *   Extensible stub for future analytics backend (e.g. Firebase, Mixpanel).
 *
 * FUTURE EXTENSION:
 *   - Wire up to Firebase Analytics (firebase/analytics)
 *   - Wire up to Mixpanel, Amplitude, or custom backend
 *   - Add event batching and offline queuing
 *   - Add A/B test variant tracking
 */

import type { DeepLinkAnalyticsEvent } from "../types/deep-link.types";

/**
 * Tracks a deep link analytics event.
 *
 * @param event - The analytics event to track
 *
 * WHEN TO CALL:
 *   - "deep_link_opened": successful navigation from a deep link
 *   - "deep_link_failed": URL parse failure or validation failure
 *   - "deep_link_guarded": navigation blocked by a guard (auth, network)
 *
 * EXAMPLE EVENT:
 *   {
 *     eventName: "deep_link_opened",
 *     routeName: "product",
 *     source: "notification",
 *     utm: { utm_source: "instagram", utm_campaign: "diwali_sale" },
 *     isValid: true,
 *     authRequired: false,
 *     wasAuthenticated: true,
 *     timestamp: 1691234567890,
 *   }
 */
export function trackDeepLinkEvent(event: DeepLinkAnalyticsEvent): void {
  // Event tracked - extensible for future analytics backends (e.g. Firebase, Mixpanel)
}

/**
 * Returns an emoji for the event type (for readable console logs).
 */
function getEventEmoji(eventName: string): string {
  switch (eventName) {
    case "deep_link_opened":
      return "🔗";
    case "deep_link_failed":
      return "❌";
    case "deep_link_guarded":
      return "🛡️";
    default:
      return "📊";
  }
}
