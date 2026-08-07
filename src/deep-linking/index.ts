/**
 * index.ts — Deep Linking Module Public API
 *
 * WHY THIS FILE EXISTS:
 *   Barrel export that defines the public API of the deep-linking module.
 *   External consumers (e.g., _layout.tsx, NotificationProvider, product page)
 *   should ONLY import from this file — never from internal submodules.
 *
 *   This provides:
 *   1. Encapsulation — internal implementation details can change freely
 *   2. Discoverability — one import path for everything
 *   3. Tree-shaking — only used exports are bundled
 *
 * USAGE:
 *   import {
 *     useDeepLinking,
 *     usePendingNavigation,
 *     resolveNotification,
 *     DeepLinkURLBuilder,
 *   } from '../deep-linking';
 */

// ─── Hooks (React Component Usage) ─────────────────────────────────────────────
export { useDeepLinking } from "./hooks/useDeepLinking";
export { usePendingNavigation } from "./hooks/usePendingNavigation";

// ─── Resolver (Entry Points) ───────────────────────────────────────────────────
export {
  resolveUrl,
  resolveNotification,
  resolvePayload,
} from "./resolver/deep-link-resolver";

// ─── URL Builder (Sharing) ─────────────────────────────────────────────────────
export { DeepLinkURLBuilder } from "./url-builder/url-builder";

// ─── Types (for consumers who need type information) ───────────────────────────
export type {
  DeepLinkPayload,
  DeepLinkSource,
  UTMParams,
  NavigationInstruction,
  NotificationData,
  DeepLinkAnalyticsEvent,
} from "./types/deep-link.types";

// ─── Constants (for consumers who need route names) ────────────────────────────
export { DEEP_LINK_ROUTE_NAMES } from "./constants/routes";
export { CUSTOM_SCHEME, UNIVERSAL_LINK_DOMAIN } from "./constants/schemes";

// ─── Storage (for advanced usage — e.g., clearing pending nav on logout) ───────
export { usePendingNavigationStore } from "./storage/pending-navigation.store";
