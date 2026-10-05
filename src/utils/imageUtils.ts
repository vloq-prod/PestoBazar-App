// src/utils/imageUtils.ts

/**
 * Fallback static CDN base URL if an API happens to send a relative path.
 * Can also be overridden by EXPO_PUBLIC_CDN_URL in environment.
 */
export const STATIC_CDN_BASE_URL =
  process.env.EXPO_PUBLIC_CDN_URL || "https://static-cdn.pestobazaar.com/";

/**
 * Resolves any image URL or path safely.
 *
 * - If the path is already a valid full URL (https://...), returns it directly.
 * - Filters out localhost or invalid local IP addresses.
 * - If a relative path is passed (e.g. /pestobazaar/uploads/...), prefixes with the CDN URL.
 */
export const getImageUrl = (path?: string | null): string | undefined => {
  if (!path || typeof path !== "string") return undefined;

  const trimmed = path.trim();
  if (!trimmed) return undefined;

  // If already absolute URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    if (trimmed.includes("localhost") || trimmed.includes("127.0.0.1")) {
      return undefined;
    }
    return trimmed;
  }

  // Fallback for relative path
  const base = STATIC_CDN_BASE_URL.endsWith("/")
    ? STATIC_CDN_BASE_URL
    : `${STATIC_CDN_BASE_URL}/`;
  const cleanPath = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;

  return `${base}${cleanPath}`;
};

export default getImageUrl;
