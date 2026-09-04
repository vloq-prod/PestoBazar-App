

import type { DeepLinkPayload, NotificationData } from "../types/deep-link.types";
import { parseDeepLinkUrl } from "../parser/url-parser";
import { Linking } from "react-native";
import { normalizeNotificationData } from "../parser/notification-normalizer";
import { validateDeepLink } from "../validator/url-validator";
import { runGuardPipeline } from "../guards/guard-pipeline";
import {
  navigateToDeepLink,
  navigateToLogin,
  navigateToFallback,
  navigateToRedirect,
} from "../navigation/navigation-router";
import { usePendingNavigationStore } from "../storage/pending-navigation.store";
import { trackDeepLinkEvent } from "../analytics/deep-link-analytics";
import { useAppVisitorStore } from "../../store/auth";

// ─── Deduplication & Dev Client Filtering ─────────────────────────────────────


function isExpoDevelopmentUrl(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.startsWith("exp://") ||
    lowerUrl.startsWith("exp+") ||
    lowerUrl.includes("expo-development-client") ||
    (lowerUrl.includes("localhost:") && !lowerUrl.includes("pestobazaar.com")) ||
    // Regex matches local IPs (e.g. 192.168.x.x, 10.x.x.x, 172.16.x.x to 172.31.x.x) with bundler port 8081
    /^(?:https?|exp):\/\/(?:192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+):8081/.test(lowerUrl)
  );
}

function isGoogleOAuthRedirect(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.startsWith("com.googleusercontent.apps.") &&
    lowerUrl.includes("/oauth2redirect")
  );
}


let _lastResolvedInput = "";
let _lastResolvedTime = 0;
const DEDUP_WINDOW_MS = 2000; // 2 seconds

// ─── Public API ────────────────────────────────────────────────────────────────

export async function resolveUrl(rawUrl: string): Promise<void> {
  if (!rawUrl || typeof rawUrl !== "string") {
    return;
  }

  // Step 0: Bypass route validation for Google OAuth redirect callbacks
  if (isGoogleOAuthRedirect(rawUrl)) {
    return;
  }

  // Filter out internal Expo development connection links
  if (isExpoDevelopmentUrl(rawUrl)) {
    return;
  }

  // Deduplication — prevent processing the same link twice in rapid succession
  if (isDuplicate(rawUrl)) {
    return;
  }

  // Step 1: Parse
  const payload = parseDeepLinkUrl(rawUrl);
  if (!payload) {
    trackDeepLinkEvent({
      eventName: "deep_link_failed",
      routeName: "unknown",
      source: "unknown",
      utm: {},
      isValid: false,
      authRequired: false,
      wasAuthenticated: false,
      validationErrors: ["PARSE_FAILURE"],
      timestamp: Date.now(),
    });
    navigateToFallback();
    return;
  }

  // Step 2: Continue with common pipeline
  await processPipeline(payload);
}


export async function resolveNotification(data: NotificationData): Promise<void> {
  if (!data || typeof data !== "object") {
    return;
  }

  // Step 1: Normalize
  const payload = normalizeNotificationData(data);
  if (!payload) {
    return;
  }

  // Step 2: Continue with common pipeline
  await processPipeline(payload);
}


export async function resolvePayload(payload: DeepLinkPayload): Promise<void> {
  await processPipeline(payload);
}

// ─── Pipeline ──────────────────────────────────────────────────────────────────

/**
 * The core pipeline that processes a parsed DeepLinkPayload.
 * Shared by resolveUrl(), resolveNotification(), and resolvePayload().
 *
 * @param payload - The parsed deep link payload
 *
 * PIPELINE STAGES:
 *   1. VALIDATE → security and correctness checks
 *   2. GUARD → auth and network checks
 *   3. NAVIGATE → execute navigation via Expo Router
 *   4. TRACK → fire analytics event
 */
async function processPipeline(payload: DeepLinkPayload): Promise<void> {
  // If the routeName is "url", open it in external browser!
  if (payload.routeName === "url" && payload.slug) {
    try {
      await Linking.openURL(payload.slug);
    } catch (e) {
    }
    return;
  }

  const { userId } = useAppVisitorStore.getState();
  const isAuthenticated = !!userId;

  // ── Stage 1: Validate ───────────────────────────────────────────────────
  const validation = validateDeepLink(payload);

  if (!validation.isValid) {
    // Track the failure
    trackDeepLinkEvent({
      eventName: "deep_link_failed",
      routeName: payload.routeName,
      source: payload.source,
      utm: payload.utm,
      isValid: false,
      authRequired: false,
      wasAuthenticated: isAuthenticated,
      validationErrors: validation.errors.map((e) => e.code),
      timestamp: Date.now(),
    });

    // For unknown routes, still try to fallback gracefully
    navigateToFallback();
    return;
  }

  // ── Stage 2: Guard ──────────────────────────────────────────────────────
  const guardResult = runGuardPipeline(payload);

  if (guardResult.action === "REDIRECT") {
    // If auth guard blocked, store pending navigation
    if (guardResult.guardName === "AuthGuard") {
      await usePendingNavigationStore.getState().setPending(payload);
      navigateToLogin();
    } else {
      // Other redirects (e.g., network guard → no internet)
      navigateToRedirect(guardResult.redirectTo!);
    }

    // Track the guarded event
    trackDeepLinkEvent({
      eventName: "deep_link_guarded",
      routeName: payload.routeName,
      source: payload.source,
      utm: payload.utm,
      isValid: true,
      authRequired: true,
      wasAuthenticated: isAuthenticated,
      blockedBy: guardResult.guardName,
      timestamp: Date.now(),
    });
    return;
  }

  if (guardResult.action === "BLOCK") {
    navigateToFallback();
    return;
  }

  // ── Stage 3: Navigate ───────────────────────────────────────────────────
  navigateToDeepLink(payload);

  // ── Stage 4: Track ──────────────────────────────────────────────────────
  trackDeepLinkEvent({
    eventName: "deep_link_opened",
    routeName: payload.routeName,
    source: payload.source,
    utm: payload.utm,
    isValid: true,
    authRequired: false,
    wasAuthenticated: isAuthenticated,
    timestamp: Date.now(),
  });
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Checks if a URL is a duplicate of the last resolved URL.
 * Prevents double-processing from cold start + warm start events.
 */
function isDuplicate(rawInput: string): boolean {
  const now = Date.now();
  if (rawInput === _lastResolvedInput && now - _lastResolvedTime < DEDUP_WINDOW_MS) {
    return true;
  }
  _lastResolvedInput = rawInput;
  _lastResolvedTime = now;
  return false;
}
