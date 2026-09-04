/**
 * url-parser.ts
 *
 * WHY THIS FILE EXISTS:
 *   The core parser that converts raw URL strings (from custom scheme or
 *   universal links) into a canonical DeepLinkPayload. This is the first
 *   stage of the deep link pipeline — everything downstream depends on
 *   the payload this parser produces.
 *
 * RESPONSIBILITIES:
 *   - Parse both `pestobazaar://product/123` and `https://pestobazaar.com/product/123`
 *   - Extract route name from the URL path
 *   - Extract resource ID (numeric) from the URL path
 *   - Extract slug (string) from the URL path
 *   - Parse query parameters and extract UTM/coupon/referral
 *   - Determine the deep link source (custom scheme vs universal link)
 *
 * DEPENDENCIES:
 *   - deep-link.types.ts (DeepLinkPayload, DeepLinkSource)
 *   - schemes.ts (CUSTOM_SCHEME, UNIVERSAL_LINK_DOMAIN)
 *   - routes.ts (findRouteByPathPattern)
 *   - query-extractor.ts (parseQueryString, extractUTMParams, etc.)
 *   - url-sanitizer.ts (sanitizeParam, safeDecodeURIComponent)
 *
 * DESIGN DECISIONS:
 *   - Uses string splitting instead of the URL constructor for custom schemes.
 *     WHY: React Native's URL polyfill doesn't fully support custom schemes.
 *     The URL constructor throws on `pestobazaar://product/123` in some RN versions.
 *
 *   - For https:// URLs, uses the URL constructor since it's reliable for standard URLs.
 *
 * FUTURE EXTENSION:
 *   - Add path pattern matching with regex for complex routes (e.g., /product/123/reviews)
 *   - Add support for fragment-based routing (#product/123)
 */

import type { DeepLinkPayload, DeepLinkSource } from "../types/deep-link.types";
import { CUSTOM_SCHEME, ALLOWED_HOSTS } from "../constants/schemes";
import {
  findRouteByPathPattern,
  DEEP_LINK_ROUTE_NAMES,
} from "../constants/routes";
import {
  parseQueryString,
  extractUTMParams,
  extractCouponCode,
  extractReferralCode,
} from "./query-extractor";
import { sanitizeParam, safeDecodeURIComponent } from "../utils/url-sanitizer";

// ─── Main Parser ───────────────────────────────────────────────────────────────

/**
 * Parses a raw URL string into a canonical DeepLinkPayload.
 *
 * @param rawUrl - The raw URL string (custom scheme or universal link)
 * @returns A fully parsed DeepLinkPayload, or null if the URL is completely unparseable
 *
 * FLOW:
 *   1. Determine source (custom scheme vs universal link)
 *   2. Extract path and query string
 *   3. Split path into segments
 *   4. Match first segment against route registry
 *   5. Extract ID/slug from subsequent segments
 *   6. Parse query params for UTM/coupon/referral
 *   7. Assemble and return DeepLinkPayload
 *
 * EDGE CASES:
 *   - Empty URL → returns null
 *   - URL with only scheme → returns HOME route
 *   - URL with unknown route → routeName = "unknown" (validator will catch)
 *   - URL with no ID where expected → id will be undefined (validator can check)
 *   - Query params with duplicate keys → last value wins
 *
 * EXAMPLE:
 *   parseDeepLinkUrl("pestobazaar://product/123?coupon=SAVE10&utm_source=instagram")
 *   →
 *   {
 *     rawInput: "pestobazaar://product/123?coupon=SAVE10&utm_source=instagram",
 *     source: "custom_scheme",
 *     routeName: "product",
 *     id: 123,
 *     queryParams: { coupon: "SAVE10", utm_source: "instagram" },
 *     utm: { utm_source: "instagram" },
 *     couponCode: "SAVE10",
 *     receivedAt: 1691234567890,
 *   }
 */
export function parseDeepLinkUrl(rawUrl: string): DeepLinkPayload | null {
  if (!rawUrl || typeof rawUrl !== "string") {
    return null;
  }

  const trimmedUrl = rawUrl.trim();
  if (!trimmedUrl) return null;

  try {
    // Step 1: Determine source and extract path+query
    const { source, pathString, queryString } = extractUrlParts(trimmedUrl);

    // Step 2: Parse query params
    const queryParams = parseQueryString(queryString);

    // Step 3: Split path into segments (filter empty)
    const segments = pathString
      .split("/")
      .map((s) => safeDecodeURIComponent(s.trim()))
      .filter((s) => s.length > 0);

    // Step 4: Extract route name from first segment
    const firstSegment = segments[0] || "";
    const routeConfig = findRouteByPathPattern(firstSegment);
    const routeName = routeConfig?.name || "unknown";

    // Step 5: Extract ID or slug from second segment
    const secondSegment = segments[1] || "";
    const idFromPath = parseIdFromSegment(secondSegment);
    const slugFromPath =
      idFromPath === undefined ? secondSegment || undefined : undefined;

    // Step 6: Also check query params for ID/slug (notification links often use these)
    const idFromQuery = parseIdFromSegment(
      queryParams["id"] ||
        queryParams["product_id"] ||
        queryParams["order_id"] ||
        "",
    );

    const slugFromQuery =
      queryParams["slug"] ||
      queryParams["product_slug"] ||
      queryParams["category_slug"] ||
      undefined;

    // Step 7: Merge — path takes precedence over query params
    const id = idFromPath ?? idFromQuery;
    const slug = slugFromPath || slugFromQuery;

    // Step 8: Extract UTM, coupon, referral
    const utm = extractUTMParams(queryParams);
    const couponCode = extractCouponCode(queryParams);
    const referralCode = extractReferralCode(queryParams);

    return {
      rawInput: trimmedUrl,
      source,
      routeName,
      id,
      slug: slug ? sanitizeParam(slug) : undefined,
      queryParams,
      utm,
      couponCode,
      referralCode,
      receivedAt: Date.now(),
    };
  } catch (error) {
    return null;
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Determines the deep link source and extracts path + query from a raw URL.
 *
 * @param url - The raw URL string
 * @returns Source type, path string, and query string
 *
 * WHY MANUAL PARSING FOR CUSTOM SCHEME:
 *   The URL constructor in React Native's JSC/Hermes engine doesn't
 *   reliably handle custom schemes. `new URL("pestobazaar://product/123")`
 *   may throw or return unexpected results. Manual splitting is reliable.
 */
function extractUrlParts(url: string): {
  source: DeepLinkSource;
  pathString: string;
  queryString: string;
} {
  const customSchemePrefix = `${CUSTOM_SCHEME}://`;

  if (url.toLowerCase().startsWith(customSchemePrefix)) {
    // Custom scheme: pestobazaar://product/123?foo=bar
    const withoutScheme = url.substring(customSchemePrefix.length);
    const [pathString, queryString] = splitPathAndQuery(withoutScheme);

    return {
      source: "custom_scheme",
      pathString,
      queryString: queryString || "",
    };
  }

  if (url.startsWith("https://") || url.startsWith("http://")) {
    // Universal link: https://pestobazaar.com/product/123?foo=bar
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();

      // Verify host is one of our allowed domains
      const isAllowedHost = ALLOWED_HOSTS.some(
        (allowed) => host === allowed.toLowerCase(),
      );

      return {
        source: isAllowedHost ? "universal_link" : "unknown",
        pathString: parsed.pathname,
        queryString: parsed.search ? parsed.search.substring(1) : "", // Remove leading "?"
      };
    } catch {
      // If URL constructor fails, fall back to manual parsing
      const withoutScheme = url.replace(/^https?:\/\//, "");
      const slashIndex = withoutScheme.indexOf("/");
      const pathAndQuery =
        slashIndex >= 0 ? withoutScheme.substring(slashIndex) : "";
      const [pathString, queryString] = splitPathAndQuery(pathAndQuery);

      return {
        source: "unknown",
        pathString,
        queryString: queryString || "",
      };
    }
  }

  // Unknown scheme — treat as-is
  return {
    source: "unknown",
    pathString: url,
    queryString: "",
  };
}

/**
 * Splits a path+query string at the "?" boundary.
 *
 * @param pathAndQuery - e.g., "product/123?foo=bar"
 * @returns [path, query] tuple
 */
function splitPathAndQuery(pathAndQuery: string): [string, string] {
  const qIndex = pathAndQuery.indexOf("?");
  if (qIndex === -1) return [pathAndQuery, ""];
  return [
    pathAndQuery.substring(0, qIndex),
    pathAndQuery.substring(qIndex + 1),
  ];
}

/**
 * Attempts to parse a path segment as a numeric ID.
 *
 * @param segment - A URL path segment (e.g., "123" or "product-slug")
 * @returns The numeric ID if the segment is a valid positive integer, else undefined
 *
 * EDGE CASES:
 *   - "123" → 123
 *   - "0" → undefined (0 is not a valid resource ID)
 *   - "-5" → undefined (negative IDs don't exist)
 *   - "12.5" → undefined (must be integer)
 *   - "abc" → undefined (not a number)
 *   - "" → undefined
 */
function parseIdFromSegment(segment: string): number | undefined {
  if (!segment) return undefined;

  const num = Number(segment);

  if (!Number.isFinite(num) || num <= 0 || !Number.isInteger(num)) {
    return undefined;
  }

  return num;
}
