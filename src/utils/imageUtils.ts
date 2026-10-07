// src/utils/imageUtils.ts

import { BASE_URL } from "../lib/apiClient";

/**
 * Fallback static CDN base URL if an API happens to send a relative path.
 * Can also be overridden by EXPO_PUBLIC_CDN_URL in environment.
 */
export const STATIC_CDN_BASE_URL =
  process.env.EXPO_PUBLIC_CDN_URL || "https://static-cdn.pestobazaar.com/";

/**
 * Resolves any image URL or path safely.
 *
 * - If the path is a local file URI (file://, content://), returns it directly for preview.
 * - If the path is already a valid full URL (https://...), returns it directly.
 * - Filters out localhost or invalid local IP addresses.
 * - If it's a return product image, unboxing video, or refund document, resolves against the dynamic backend server (BASE_URL).
 * - If a relative path is passed for catalog images, prefixes with the CDN URL.
 */
export const getImageUrl = (path?: string | null): string | undefined => {
  if (!path || typeof path !== "string") return undefined;

  const trimmed = path.trim();
  if (!trimmed) return undefined;

  // Local file URIs (for ImagePicker previews)
  if (trimmed.startsWith("file://") || trimmed.startsWith("content://")) {
    return trimmed;
  }

  // If already absolute URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    if (trimmed.includes("localhost") || trimmed.includes("127.0.0.1")) {
      return undefined;
    }
    return trimmed;
  }

  const cleanServerBase = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
  const cleanCdnBase = STATIC_CDN_BASE_URL.endsWith("/")
    ? STATIC_CDN_BASE_URL
    : `${STATIC_CDN_BASE_URL}/`;

  let cleanPath = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;

  // If it's a bare return photo filename like "1791206060_6ac3a2ac4b3dc.png"
  if (!cleanPath.includes("/") && /\.(png|jpe?g|webp|gif)$/i.test(cleanPath)) {
    cleanPath = `pestobazaar/assets/return_product/${cleanPath}`;
    return `${cleanServerBase}${cleanPath}`;
  }

  // If it's a bare return video filename like "1777962816919_Screenrecorder-2026-05-02-18-29-56-117.mp4"
  if (!cleanPath.includes("/") && /\.(mp4|mov|avi|mkv|webm)$/i.test(cleanPath)) {
    cleanPath = `uploads/return-videos/${cleanPath}`;
    return `${cleanServerBase}${cleanPath}`;
  }

  // Determine if it's a dynamic uploaded asset (return products, videos, refund docs)
  const isDynamicAsset =
    cleanPath.includes("return_product") ||
    cleanPath.includes("return-videos") ||
    cleanPath.includes("refund_docs");

  const base = isDynamicAsset ? cleanServerBase : cleanCdnBase;
  return `${base}${cleanPath}`;
};

export default getImageUrl;
