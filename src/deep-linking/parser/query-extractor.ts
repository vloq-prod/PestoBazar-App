/**
 * query-extractor.ts
 *
 * WHY THIS FILE EXISTS:
 *   Extracts structured data from URL query parameters. Specifically handles
 *   UTM parameters, coupon codes, and referral codes — which are critical
 *   for marketing attribution and business logic.
 *
 * RESPONSIBILITIES:
 *   - Parse raw query string into key-value pairs
 *   - Extract and return UTM parameters as a typed object
 *   - Extract coupon and referral codes from query params
 *
 * DEPENDENCIES:
 *   - deep-link.types.ts (UTMParams)
 *   - url-sanitizer.ts (sanitizeParam, safeDecodeURIComponent)
 *
 * FUTURE EXTENSION:
 *   - Add support for custom campaign parameters
 *   - Add support for A/B test variant params
 */

import type { UTMParams } from "../types/deep-link.types";
import { sanitizeParam, safeDecodeURIComponent } from "../utils/url-sanitizer";

// ─── UTM Keys ──────────────────────────────────────────────────────────────────

/**
 * Standard UTM parameter keys as defined by Google Analytics.
 * Using typed constants ensures we only extract known UTM params.
 */
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

// ─── Query String Parsing ──────────────────────────────────────────────────────

/**
 * Parses a raw query string into a sanitized key-value record.
 *
 * @param queryString - The query string WITHOUT the leading "?"
 * @returns Sanitized key-value pairs
 *
 * EDGE CASES:
 *   - Empty string → empty record
 *   - Duplicate keys → last value wins (standard behavior)
 *   - Keys without values (e.g., "?flag") → value is empty string
 *   - URL-encoded values → decoded safely
 *
 * EXAMPLE:
 *   parseQueryString("q=iphone&coupon=SALE50&utm_source=instagram")
 *   → { q: "iphone", coupon: "SALE50", utm_source: "instagram" }
 */
export function parseQueryString(queryString: string): Record<string, string> {
  if (!queryString) return {};

  const params: Record<string, string> = {};

  // Split on & and process each pair
  const pairs = queryString.split("&");

  for (const pair of pairs) {
    const eqIndex = pair.indexOf("=");

    if (eqIndex === -1) {
      // Key without value: "?flag" → { flag: "" }
      const key = sanitizeParam(safeDecodeURIComponent(pair));
      if (key) params[key] = "";
      continue;
    }

    const rawKey = pair.substring(0, eqIndex);
    const rawValue = pair.substring(eqIndex + 1);

    const key = sanitizeParam(safeDecodeURIComponent(rawKey));
    const value = sanitizeParam(safeDecodeURIComponent(rawValue));

    if (key) {
      params[key] = value;
    }
  }

  return params;
}

// ─── UTM Extraction ────────────────────────────────────────────────────────────

/**
 * Extracts UTM parameters from a query params record.
 *
 * @param queryParams - Parsed query parameters
 * @returns UTMParams object with only the UTM fields that were present
 *
 * BUSINESS LOGIC:
 *   Only includes UTM keys that actually have non-empty values.
 *   This keeps the analytics payload lean (no utm_content: "" clutter).
 */
export function extractUTMParams(queryParams: Record<string, string>): UTMParams {
  const utm: Record<string, string> = {};

  for (const key of UTM_KEYS) {
    const value = queryParams[key];
    if (value && value.trim().length > 0) {
      utm[key] = value.trim();
    }
  }

  return utm as UTMParams;
}

// ─── Coupon & Referral Extraction ──────────────────────────────────────────────

/**
 * Extracts a coupon code from query parameters.
 * Checks multiple possible key names because different marketing
 * channels may use different parameter names.
 *
 * @param queryParams - Parsed query parameters
 * @returns The coupon code, or undefined if not present
 *
 * SUPPORTED KEYS: coupon, coupon_code, promo, promo_code, code
 */
export function extractCouponCode(queryParams: Record<string, string>): string | undefined {
  const keys = ["coupon", "coupon_code", "promo", "promo_code", "code"];

  for (const key of keys) {
    const value = queryParams[key];
    if (value && value.trim().length > 0) {
      return value.trim().toUpperCase(); // Coupon codes are typically uppercase
    }
  }

  return undefined;
}

/**
 * Extracts a referral code from query parameters.
 *
 * @param queryParams - Parsed query parameters
 * @returns The referral code, or undefined if not present
 *
 * SUPPORTED KEYS: ref, referral, referral_code, invite, invite_code
 */
export function extractReferralCode(queryParams: Record<string, string>): string | undefined {
  const keys = ["ref", "referral", "referral_code", "invite", "invite_code"];

  for (const key of keys) {
    const value = queryParams[key];
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}
