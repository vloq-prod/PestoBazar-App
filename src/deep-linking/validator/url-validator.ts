/**
 * url-validator.ts
 *
 * WHY THIS FILE EXISTS:
 *   Security layer that validates deep link payloads BEFORE they reach
 *   the guards and navigation. Prevents navigation injection, malformed
 *   URLs, and unsafe parameters from causing unexpected behavior.
 *
 * RESPONSIBILITIES:
 *   - Validate URL scheme against whitelist
 *   - Detect path traversal attempts
 *   - Validate URL length limits
 *   - Check for dangerous content in parameters
 *   - Verify route exists in the registry
 *   - Check required parameters are present
 *
 * DEPENDENCIES:
 *   - deep-link.types.ts (ValidationResult, ValidationError, DeepLinkPayload)
 *   - url-sanitizer.ts (containsDangerousContent, containsPathTraversal, isUrlLengthValid)
 *   - routes.ts (findRouteByName)
 *
 * DESIGN DECISIONS:
 *   - Collects ALL validation errors (doesn't short-circuit).
 *     WHY: For debugging and analytics, knowing ALL problems with a URL
 *     is more useful than knowing just the first one.
 *
 *   - Returns a result object instead of throwing.
 *     WHY: The resolver can decide what to do with invalid payloads
 *     (fallback to home, show error, etc.) rather than catching exceptions.
 *
 * FUTURE EXTENSION:
 *   - Add URL signature verification for authenticated deep links
 *   - Add rate limiting for deep links from the same source
 */

import type {
  DeepLinkPayload,
  ValidationResult,
  ValidationError,
  ValidationErrorCode,
} from "../types/deep-link.types";
import {
  containsDangerousContent,
  containsPathTraversal,
  isUrlLengthValid,
} from "../utils/url-sanitizer";
import { findRouteByName } from "../constants/routes";
import { ALLOWED_SCHEMES } from "../constants/schemes";

// ─── Main Validator ────────────────────────────────────────────────────────────

/**
 * Validates a parsed DeepLinkPayload for security and correctness.
 *
 * @param payload - The parsed deep link payload to validate
 * @returns ValidationResult with isValid flag and array of errors
 *
 * VALIDATION RULES (in order):
 *   1. URL length must be within limits
 *   2. Raw input must not contain path traversal
 *   3. Raw input must not contain dangerous content (XSS)
 *   4. Source must be identifiable (not "unknown" — unless from notification)
 *   5. Route must exist in the registry (or be "unknown")
 *   6. Required parameters must be present
 *
 * EDGE CASES:
 *   - Notification payloads may have source "notification" which is always valid
 *   - "unknown" routes are flagged but not considered a critical security issue
 *   - Empty required params result in a MISSING_REQUIRED_PARAM error
 */
export function validateDeepLink(payload: DeepLinkPayload): ValidationResult {
  const errors: ValidationError[] = [];

  // Rule 1: URL length check
  if (!isUrlLengthValid(payload.rawInput)) {
    errors.push(createError("INVALID_URL", "URL exceeds maximum length"));
  }

  // Rule 2: Path traversal detection
  if (containsPathTraversal(payload.rawInput)) {
    errors.push(createError("PATH_TRAVERSAL", "Path traversal detected in URL"));
  }

  // Rule 3: Dangerous content detection
  if (containsDangerousContent(payload.rawInput)) {
    errors.push(createError("DANGEROUS_CHARS", "Dangerous content detected in URL"));
  }

  // Rule 4: Source validation (notification sources are always trusted)
  if (payload.source === "unknown" && payload.rawInput.includes("://")) {
    // Only flag unknown sources for URL-based deep links, not notifications
    const scheme = payload.rawInput.split("://")[0]?.toLowerCase();
    if (scheme && !ALLOWED_SCHEMES.includes(scheme)) {
      errors.push(createError("INVALID_SCHEME", `Scheme "${scheme}" is not allowed`));
    }
  }

  // Rule 5: Route existence check
  if (payload.routeName === "unknown") {
    errors.push(createError("UNKNOWN_ROUTE", `Route not found for input: ${payload.rawInput.substring(0, 100)}`));
  }

  // Rule 6: Required parameter check
  if (payload.routeName !== "unknown") {
    const routeConfig = findRouteByName(payload.routeName);
    if (routeConfig) {
      for (const requiredParam of routeConfig.requiredParams) {
        const hasParam = hasRequiredParam(payload, requiredParam);
        if (!hasParam) {
          errors.push(
            createError(
              "MISSING_REQUIRED_PARAM",
              `Required parameter "${requiredParam}" is missing for route "${payload.routeName}"`,
            ),
          );
        }
      }
    }
  }

  // Rule 7: Check individual query params for dangerous content
  for (const [key, value] of Object.entries(payload.queryParams)) {
    if (containsDangerousContent(key) || containsDangerousContent(value)) {
      errors.push(
        createError("DANGEROUS_CHARS", `Dangerous content in query param: ${key}`),
      );
    }
    if (value.length > 500) {
      errors.push(
        createError("PARAM_TOO_LONG", `Query param "${key}" exceeds maximum length`),
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Creates a ValidationError object.
 */
function createError(code: ValidationErrorCode, message: string): ValidationError {
  return { code, message };
}

/**
 * Checks if a required parameter is present in the payload.
 * Checks both named fields (id, slug) and query params.
 *
 * @param payload - The deep link payload
 * @param paramName - The required parameter name
 * @returns true if the parameter has a non-empty value
 *
 * MAPPING:
 *   - "id" → checks payload.id
 *   - "slug" → checks payload.slug
 *   - "reviewsid" → checks payload.id (reviews use numeric IDs)
 *   - "all" → checks payload.slug or payload.id
 *   - Anything else → checks queryParams
 */
function hasRequiredParam(payload: DeepLinkPayload, paramName: string): boolean {
  switch (paramName) {
    case "id":
      return payload.id !== undefined && payload.id > 0;

    case "slug":
      return (
        (payload.slug !== undefined && payload.slug.length > 0) ||
        (payload.id !== undefined && payload.id > 0)
      );

    case "reviewsid":
      return payload.id !== undefined && payload.id > 0;

    case "all":
      return (
        (payload.slug !== undefined && payload.slug.length > 0) ||
        (payload.id !== undefined && payload.id > 0)
      );

    default:
      return (
        payload.queryParams[paramName] !== undefined &&
        payload.queryParams[paramName].length > 0
      );
  }
}
