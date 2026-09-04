/**
 * notification-normalizer.ts
 *
 * WHY THIS FILE EXISTS:
 *   FCM notification data payloads have a different shape than deep link URLs.
 *   The backend sends JSON with fields like "type", "id", "product_slug" etc.
 *   This normalizer converts those payloads into the same DeepLinkPayload
 *   that the URL parser produces — so the ENTIRE pipeline (guards, navigation,
 *   analytics) works identically for URLs and notifications.
 *
 *   THIS ELIMINATES THE DUPLICATE NAVIGATION LOGIC that currently exists
 *   in NotificationProvider.tsx.
 *
 * RESPONSIBILITIES:
 *   - Convert FCM notification data → DeepLinkPayload
 *   - Handle all known backend field name variations
 *   - Extract resource IDs and slugs from notification data
 *   - Handle the "route" field (explicit Expo Router path)
 *
 * DEPENDENCIES:
 *   - deep-link.types.ts (DeepLinkPayload, NotificationData)
 *   - routes.ts (findRouteByPathPattern, DEEP_LINK_ROUTE_NAMES)
 *   - param-helpers.ts (safeString, safePositiveInt, coalesce)
 *
 * KNOWN BACKEND FIELD PATTERNS (from NotificationProvider.tsx):
 *   - route: explicit Expo Router path (highest priority)
 *   - type / redirect_type / app_redirect_key: route type identifier
 *   - id / product_slug / slug: resource identifiers
 *   - title / product_name: display names
 *   - order_id: order-specific identifier
 *   - category_slug: category identifier
 *   - section_id: custom section identifier
 *
 * FUTURE EXTENSION:
 *   - Add new notification types by adding cases to the switch
 *   - Add batch notification handling for notification center
 */

import type {
  DeepLinkPayload,
  NotificationData,
} from "../types/deep-link.types";
import {
  findRouteByPathPattern,
  DEEP_LINK_ROUTE_NAMES,
} from "../constants/routes";
import { safeString, safePositiveInt, coalesce } from "../utils/param-helpers";

/**
 * Normalizes an FCM notification data payload into a DeepLinkPayload.
 *
 * @param data - Raw notification data from FCM (Record<string, unknown>)
 * @returns A DeepLinkPayload that can be processed by the resolver pipeline,
 *          or null if the data is empty or completely unrecognizable
 *
 * FLOW:
 *   1. Check if `route` field exists (explicit path — highest priority)
 *   2. Otherwise, extract `type` from multiple possible field names
 *   3. Map the type to a route name using the route registry
 *   4. Extract ID and slug based on the route type
 *   5. Build and return a DeepLinkPayload
 *
 * BUSINESS LOGIC:
 *   The backend can send the route type in THREE different field names:
 *   - `type`: most common
 *   - `redirect_type`: used in some campaigns
 *   - `app_redirect_key`: used in CMS-driven notifications
 *
 *   The `coalesce` helper tries each in order and uses the first non-empty one.
 *
 * EDGE CASES:
 *   - Empty data → returns null
 *   - Only `route` field → navigates to that exact path
 *   - Unknown type → routeName = "unknown" (resolver will fallback to home)
 *   - Missing ID for product notification → id will be undefined (route may still work with slug)
 */
export function normalizeNotificationData(
  data: NotificationData,
): DeepLinkPayload | null {
  if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
    return null;
  }

  const rawInput = JSON.stringify(data);
  const receivedAt = Date.now();

  // ── Priority 1: Explicit route field ──────────────────────────────────────
  // If the backend sends a complete Expo Router path, use it directly.
  // This is the most flexible option for the backend team.
  const explicitRoute = safeString(data, "route");
  if (explicitRoute) {
    return {
      rawInput,
      source: "notification",
      routeName: extractRouteNameFromExplicitPath(explicitRoute),
      queryParams: {},
      utm: {},
      receivedAt,
    };
  }

  // ── Priority 2: Type-based routing ────────────────────────────────────────
  const redirectType = coalesce(data, [
    "action_type",
    "type",
    "redirect_type",
    "app_redirect_key",
    "screen",
  ]);

  if (!redirectType) {
    return null;
  }

  // Normalize type aliases (backend may send "products" or "product")
  const normalizedType = normalizeRedirectType(redirectType);

  // Look up the route in the registry
  const routeConfig = findRouteByPathPattern(normalizedType);
  const routeName =
    normalizedType === "url" ? "url" : routeConfig?.name || "unknown";

  // ── Extract IDs and slugs based on type ───────────────────────────────────
  const { id, slug, queryParams } = extractParamsForType(normalizedType, data);

  return {
    rawInput,
    source: "notification",
    routeName,
    id,
    slug,
    queryParams: queryParams || {},
    utm: {},
    receivedAt,
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Normalizes redirect type aliases into canonical route names.
 *
 * @param type - The raw type string from the notification
 * @returns Normalized type string
 *
 * WHY: The backend may send "products" (plural) or "order_details" (with underscore).
 * This normalizer maps those variations to the canonical path pattern.
 */
function normalizeRedirectType(type: string): string {
  const normalizations: Record<string, string> = {
    products: "product",
    categories: "category",
    order_details: "orderdetails",
    order_detail: "orderdetails",
    custom_section: "section",
    category_detail: "category",
    best_selling: "viewall",
    new_arrival: "viewall",
    top_rated: "viewall",
    trending: "viewall",
    do_if_yourself: "diy",
    coupon: "coupons",
    return: "returndetails",
    whishlist: "wishlist",
    wishlist: "wishlist",
    notifications: "notifications",
    notification: "notifications",
  };

  const lower = type.toLowerCase().trim();
  return normalizations[lower] || lower;
}

/**
 * Extracts ID, slug, and extra params from notification data based on the route type.
 *
 * @param type - Normalized route type
 * @param data - Raw notification data
 * @returns Object with id, slug, and extra queryParams
 *
 * BUSINESS LOGIC:
 *   Different notification types send IDs in different field names:
 *   - product: id, product_slug, slug, product_name
 *   - order: order_id, id
 *   - category: category_slug, slug
 *   - section: section_id, id
 */
function extractParamsForType(
  type: string,
  data: NotificationData,
): {
  id?: number;
  slug?: string;
  queryParams?: Record<string, string>;
} {
  switch (type) {
    case "product": {
      const id =
        safePositiveInt(data as Record<string, unknown>, "id") ??
        safePositiveInt(data as Record<string, unknown>, "action_value");
      const slug = coalesce(data as Record<string, unknown>, [
        "product_slug",
        "slug",
        "action_value",
      ]);
      const productName =
        safeString(data as Record<string, unknown>, "title") ||
        safeString(data as Record<string, unknown>, "product_name");

      return {
        id,
        slug: slug || undefined,
        queryParams: {
          ...(productName ? { product_name: productName } : {}),
        },
      };
    }

    case "orderdetails":
    case "order": {
      const orderId =
        safePositiveInt(data as Record<string, unknown>, "order_id") ??
        safePositiveInt(data as Record<string, unknown>, "id") ??
        safePositiveInt(data as Record<string, unknown>, "action_value");
      return { id: orderId };
    }

    case "category": {
      const slug = coalesce(data as Record<string, unknown>, [
        "category_id",
        "category_slug",
        "slug",
        "id",
        "action_value",
      ]);
      return { slug: slug || undefined };
    }

    case "section": {
      const id =
        safePositiveInt(data as Record<string, unknown>, "section_id") ??
        safePositiveInt(data as Record<string, unknown>, "id") ??
        safePositiveInt(data as Record<string, unknown>, "action_value");
      const title = safeString(data as Record<string, unknown>, "title");
      return {
        id,
        queryParams: {
          ...(title ? { title } : {}),
        },
      };
    }

    case "returndetails":
    case "return": {
      const returnId =
        safePositiveInt(data as Record<string, unknown>, "return_id") ??
        safePositiveInt(data as Record<string, unknown>, "id") ??
        safePositiveInt(data as Record<string, unknown>, "action_value");
      return { id: returnId };
    }

    case "viewall": {
      let slug = coalesce(data as Record<string, unknown>, [
        "slug",
        "action_value",
      ]);
      const rawActionType = safeString(
        data as Record<string, unknown>,
        "action_type",
      );

      // If slug is empty or "0" (default empty value), use action_type as the slug
      if (!slug || slug === "0") {
        slug = rawActionType;
      }

      let title = "Products";
      if (rawActionType === "best_selling") title = "Best Selling";
      else if (rawActionType === "new_arrival") title = "New Arrivals";
      else if (rawActionType === "top_rated") title = "Top Rated";
      else if (rawActionType === "trending") title = "Trending";
      return {
        slug: slug || undefined,
        queryParams: { title },
      };
    }

    case "url": {
      const url = safeString(data as Record<string, unknown>, "action_value");
      return { slug: url };
    }

    default: {
      const id =
        safePositiveInt(data as Record<string, unknown>, "id") ??
        safePositiveInt(data as Record<string, unknown>, "action_value");
      const slug = coalesce(data as Record<string, unknown>, [
        "slug",
        "action_value",
      ]);
      return {
        id,
        slug: slug || undefined,
      };
    }
  }
}

/**
 * Extracts a route name from an explicit Expo Router path.
 *
 * @param path - e.g., "/(stack)/orders" or "/(stack)/product/[id]"
 * @returns The route name, or "unknown"
 *
 * EXAMPLE:
 *   "/(stack)/product/[id]" → "product"
 *   "/(stack)/order" → "order"
 *   "/(tabs)/profile" → "profile"
 */
function extractRouteNameFromExplicitPath(path: string): string {
  // Remove group prefixes like /(stack)/ and /(tabs)/
  const cleaned = path.replace(/\/\([^)]+\)\//g, "/").replace(/^\//, "");

  // Take the first segment
  const firstSegment = cleaned.split("/")[0] || "";

  const routeConfig = findRouteByPathPattern(firstSegment);
  return routeConfig?.name || "unknown";
}
