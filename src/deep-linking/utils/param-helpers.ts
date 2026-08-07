/**
 * param-helpers.ts
 *
 * WHY THIS FILE EXISTS:
 *   Deep link parameters come as strings from URLs and notification payloads.
 *   These helpers provide type-safe extraction with proper fallbacks,
 *   preventing runtime crashes like `Number(undefined)` → NaN.
 *
 * RESPONSIBILITIES:
 *   - Extract string values with defaults
 *   - Extract numeric values with validation
 *   - Extract boolean values with proper parsing
 *   - Handle array-type values (e.g., "1,2,3")
 *
 * DEPENDENCIES: None (pure utility functions)
 *
 * FUTURE EXTENSION:
 *   - Add date parsing helper
 *   - Add enum validation helper
 */

/**
 * Safely extracts a string value from a params record.
 *
 * @param params - The parameters record
 * @param key - The key to extract
 * @param fallback - Default value if key is missing or empty
 * @returns The string value or fallback
 *
 * EDGE CASES:
 *   - Key missing → returns fallback
 *   - Value is empty string → returns fallback
 *   - Value is "undefined" or "null" (string) → returns fallback
 */
export function safeString(
  params: Record<string, unknown>,
  key: string,
  fallback: string = "",
): string {
  const value = params[key];

  if (value === undefined || value === null) return fallback;

  const str = String(value).trim();

  if (str === "" || str === "undefined" || str === "null") return fallback;

  return str;
}

/**
 * Safely extracts a numeric value from a params record.
 *
 * @param params - The parameters record
 * @param key - The key to extract
 * @param fallback - Default value if key is missing or not a valid number
 * @returns The numeric value or fallback
 *
 * EDGE CASES:
 *   - Value is "abc" → returns fallback (NaN detection)
 *   - Value is "12.5" → returns 12.5
 *   - Value is "0" → returns 0 (not fallback)
 *   - Value is negative → returns negative (valid for some IDs)
 *   - Value is Infinity → returns fallback
 */
export function safeNumber(
  params: Record<string, unknown>,
  key: string,
  fallback?: number,
): number | undefined {
  const value = params[key];

  if (value === undefined || value === null) return fallback;

  const num = Number(value);

  if (!Number.isFinite(num)) return fallback;

  return num;
}

/**
 * Safely extracts a positive integer from a params record.
 * Useful for IDs which should always be positive whole numbers.
 *
 * @param params - The parameters record
 * @param key - The key to extract
 * @param fallback - Default value if key is missing or invalid
 * @returns The positive integer or fallback
 *
 * EDGE CASES:
 *   - Value is "12.5" → returns 12 (floors to integer)
 *   - Value is "0" → returns fallback (0 is not a valid ID)
 *   - Value is "-5" → returns fallback (negative IDs don't exist)
 */
export function safePositiveInt(
  params: Record<string, unknown>,
  key: string,
  fallback?: number,
): number | undefined {
  const num = safeNumber(params, key);

  if (num === undefined || num <= 0) return fallback;

  return Math.floor(num);
}

/**
 * Safely extracts a boolean value from a params record.
 *
 * @param params - The parameters record
 * @param key - The key to extract
 * @param fallback - Default value if key is missing or ambiguous
 * @returns The boolean value or fallback
 *
 * EDGE CASES:
 *   - "true", "1", "yes" → true
 *   - "false", "0", "no" → false
 *   - Anything else → fallback
 */
export function safeBoolean(
  params: Record<string, unknown>,
  key: string,
  fallback: boolean = false,
): boolean {
  const value = params[key];

  if (value === undefined || value === null) return fallback;

  const str = String(value).trim().toLowerCase();

  if (["true", "1", "yes"].includes(str)) return true;
  if (["false", "0", "no"].includes(str)) return false;

  return fallback;
}

/**
 * Extracts first meaningful value from multiple possible keys.
 * Useful when the backend sends different field names for the same concept.
 *
 * @param params - The parameters record
 * @param keys - Array of keys to try in order
 * @param fallback - Default if none of the keys have a value
 * @returns The first non-empty value found, or fallback
 *
 * EXAMPLE:
 *   coalesce(data, ["type", "redirect_type", "app_redirect_key"])
 *   → tries each key in order, returns first non-empty value
 */
export function coalesce(
  params: Record<string, unknown>,
  keys: readonly string[],
  fallback: string = "",
): string {
  for (const key of keys) {
    const value = safeString(params, key);
    if (value) return value;
  }
  return fallback;
}
