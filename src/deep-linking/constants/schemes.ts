/**
 * schemes.ts
 *
 * WHY THIS FILE EXISTS:
 *   Centralizes all scheme and domain constants used for deep link
 *   parsing, validation, and URL building. Eliminates magic strings
 *   and ensures consistency across the entire deep-linking module.
 *
 * RESPONSIBILITIES:
 *   - Define the custom URL scheme (pestobazaar://)
 *   - Define the universal link domain (pestobazaar.com)
 *   - Define allowed schemes and hosts for validation
 *   - Define base URLs for URL building (sharing)
 *
 * DEPENDENCIES: None (pure constants)
 *
 * FUTURE EXTENSION:
 *   - Add staging/production domain switching via environment variables
 *   - Add www. subdomain support if needed
 *   - Add additional schemes if the business requires (e.g., for partner apps)
 */

// ─── Custom Scheme ─────────────────────────────────────────────────────────────

/**
 * The custom URL scheme registered in app.config.ts.
 * Used for deep links like: pestobazaar://product/123
 *
 * MUST match the `scheme` field in app.config.ts exactly.
 */
export const CUSTOM_SCHEME = "pestobazaar" as const;

// ─── Domains ───────────────────────────────────────────────────────────────────

/**
 * The production domain for universal links / app links.
 * Used for deep links like: https://pestobazaar.com/product/123
 */
export const UNIVERSAL_LINK_DOMAIN = "pestobazaar.confidevtech.com" as const;

// ─── Allowed Schemes ───────────────────────────────────────────────────────────

/**
 * Schemes that the deep link validator will accept.
 * Any URL with a scheme not in this list will be rejected.
 *
 * WHY WHITELIST:
 *   Prevents navigation injection via unexpected schemes
 *   like javascript:, data:, file:, etc.
 */
export const ALLOWED_SCHEMES: readonly string[] = [
  CUSTOM_SCHEME,   // pestobazaar://
  "https",         // https://pestobazaar.com/...
] as const;

// ─── Allowed Hosts ─────────────────────────────────────────────────────────────

/**
 * Hosts that the deep link validator will accept for HTTPS links.
 * Custom scheme links don't have a host to validate.
 *
 * WHY SEPARATE FROM SCHEMES:
 *   An HTTPS link to a random domain should not be processed
 *   by our deep link handler.
 */
export const ALLOWED_HOSTS: readonly string[] = [
  UNIVERSAL_LINK_DOMAIN,                 // pestobazaar.com
  `www.${UNIVERSAL_LINK_DOMAIN}`,        // www.pestobazaar.com
  "pestobazaar.confidevtech.com",        // pestobazaar.confidevtech.com
] as const;

// ─── URL Building ──────────────────────────────────────────────────────────────

/**
 * Base URL for generating shareable universal links.
 * Used by the URL builder for product sharing, etc.
 */
export const UNIVERSAL_LINK_BASE_URL = `https://${UNIVERSAL_LINK_DOMAIN}` as const;

/**
 * Static CDN base URL (used by the app for images).
 * Included here because share messages may include image URLs.
 */
export const STATIC_CDN_BASE_URL = "https://static-cdn.pestobazaar.com" as const;

// ─── Validation Limits ─────────────────────────────────────────────────────────

/**
 * Maximum allowed length for any single query parameter value.
 * Prevents memory exhaustion from absurdly long params.
 */
export const MAX_PARAM_LENGTH = 500 as const;

/**
 * Maximum allowed total URL length.
 * RFC 2616 doesn't define a limit, but most browsers cap at ~2048.
 */
export const MAX_URL_LENGTH = 2048 as const;
