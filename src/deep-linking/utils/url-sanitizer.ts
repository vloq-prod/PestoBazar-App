/**
 * url-sanitizer.ts
 *
 * WHY THIS FILE EXISTS:
 *   Deep link URLs come from external sources (browsers, other apps, push
 *   notifications) and CANNOT be trusted. This module sanitizes all URL parts
 *   before they enter the deep linking pipeline.
 *
 * RESPONSIBILITIES:
 *   - Strip dangerous characters and patterns from URL segments
 *   - Detect path traversal attempts (../)
 *   - Truncate values that exceed length limits
 *   - Encode/decode URL components safely
 *
 * DEPENDENCIES:
 *   - schemes.ts (MAX_PARAM_LENGTH, MAX_URL_LENGTH)
 *
 * FUTURE EXTENSION:
 *   - Add custom sanitization rules for specific param types (e.g., email)
 *   - Add URL signature verification for authenticated deep links
 */

import { MAX_PARAM_LENGTH, MAX_URL_LENGTH } from "../constants/schemes";

// ─── Dangerous Patterns ────────────────────────────────────────────────────────

/**
 * Regex patterns that indicate malicious or malformed URL content.
 *
 * WHY THESE PATTERNS:
 *   - `<script` / `javascript:` → XSS injection attempts
 *   - `../` → Path traversal to access unauthorized routes
 *   - `\x00` → Null byte injection
 *   - `data:` → Data URI scheme injection
 */
const DANGEROUS_PATTERNS: readonly RegExp[] = [
  /<script/i,
  /javascript:/i,
  /data:/i,
  /vbscript:/i,
  /\x00/,                   // Null byte
  /&#/,                     // HTML entities
  /%3Cscript/i,             // URL-encoded <script
  /on\w+\s*=/i,             // Event handlers like onclick=
];

/**
 * Regex for detecting path traversal.
 * Matches "../", "..\\", "..\", and URL-encoded variants.
 */
const PATH_TRAVERSAL_PATTERN = /(?:^|\/)\.\.(?:\/|\\|$)|%2e%2e/i;

// ─── Sanitization Functions ────────────────────────────────────────────────────

/**
 * Checks if a string contains any dangerous patterns.
 *
 * @param value - The string to check
 * @returns true if dangerous content is detected
 *
 * EDGE CASES:
 *   - Empty string → safe (returns false)
 *   - URL-encoded attacks → caught by encoded pattern checks
 */
export function containsDangerousContent(value: string): boolean {
  if (!value) return false;
  return DANGEROUS_PATTERNS.some((pattern) => pattern.test(value));
}

/**
 * Checks if a path contains traversal patterns (../).
 *
 * @param path - The URL path to check
 * @returns true if path traversal is detected
 */
export function containsPathTraversal(path: string): boolean {
  if (!path) return false;
  return PATH_TRAVERSAL_PATTERN.test(path);
}

/**
 * Sanitizes a single parameter value.
 * - Trims whitespace
 * - Truncates to MAX_PARAM_LENGTH
 * - Returns empty string if dangerous content detected
 *
 * @param value - Raw parameter value
 * @returns Sanitized parameter value
 *
 * WHY RETURN EMPTY (not throw):
 *   Throwing on a single bad param would prevent the entire deep link
 *   from being processed. It's better to silently drop the bad param
 *   and let the route work with defaults.
 */
export function sanitizeParam(value: string): string {
  if (!value) return "";

  const trimmed = value.trim();

  // Check for dangerous content
  if (containsDangerousContent(trimmed)) {
    console.warn("[DeepLink] Dangerous content detected in param, dropping:", trimmed.substring(0, 50));
    return "";
  }

  // Truncate to max length
  if (trimmed.length > MAX_PARAM_LENGTH) {
    console.warn("[DeepLink] Param exceeds max length, truncating");
    return trimmed.substring(0, MAX_PARAM_LENGTH);
  }

  return trimmed;
}

/**
 * Sanitizes all values in a query parameter record.
 *
 * @param params - Raw query parameters
 * @returns Sanitized query parameters (dangerous values replaced with empty strings)
 */
export function sanitizeQueryParams(params: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    const sanitizedKey = sanitizeParam(key);
    if (sanitizedKey) {
      sanitized[sanitizedKey] = sanitizeParam(value);
    }
  }

  return sanitized;
}

/**
 * Validates total URL length.
 *
 * @param url - The full URL string
 * @returns true if URL is within acceptable length
 */
export function isUrlLengthValid(url: string): boolean {
  return url.length <= MAX_URL_LENGTH;
}

/**
 * Safely decodes a URI component, returning the original string if decoding fails.
 *
 * WHY:
 *   decodeURIComponent throws on malformed sequences like "%E0%A4%A".
 *   We don't want the entire deep link to fail because of one bad segment.
 *
 * @param value - The value to decode
 * @returns Decoded value, or original value if decoding fails
 */
export function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
