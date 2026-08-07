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
 *   Uses console.log for now. This is intentional — the app doesn't currently
 *   have a dedicated analytics backend. When you add Firebase Analytics, Mixpanel,
 *   or your own analytics API, you only need to modify this ONE file.
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
  // ── Console logging for development and debugging ───────────────────────
  const emoji = getEventEmoji(event.eventName);
  const summary = [
    `${emoji} [DeepLink Analytics] ${event.eventName}`,
    `  Route: ${event.routeName}`,
    `  Source: ${event.source}`,
    event.utm.utm_source ? `  UTM Source: ${event.utm.utm_source}` : null,
    event.utm.utm_campaign ? `  UTM Campaign: ${event.utm.utm_campaign}` : null,
    event.utm.utm_medium ? `  UTM Medium: ${event.utm.utm_medium}` : null,
    event.blockedBy ? `  Blocked By: ${event.blockedBy}` : null,
    event.validationErrors?.length ? `  Errors: ${event.validationErrors.join(", ")}` : null,
    `  Auth Required: ${event.authRequired}`,
    `  Was Authenticated: ${event.wasAuthenticated}`,
  ]
    .filter(Boolean)
    .join("\n");

  console.log(summary);

  // ── Future: Wire to Firebase Analytics ──────────────────────────────────
  // import { getAnalytics, logEvent } from 'firebase/analytics';
  // const analytics = getAnalytics();
  // logEvent(analytics, event.eventName, {
  //   route_name: event.routeName,
  //   source: event.source,
  //   utm_source: event.utm.utm_source,
  //   utm_campaign: event.utm.utm_campaign,
  //   utm_medium: event.utm.utm_medium,
  //   is_valid: event.isValid,
  //   auth_required: event.authRequired,
  //   was_authenticated: event.wasAuthenticated,
  //   blocked_by: event.blockedBy,
  // });

  // ── Future: Wire to custom backend ──────────────────────────────────────
  // apiClient.post('/analytics/deep-link', event).catch(console.error);
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
