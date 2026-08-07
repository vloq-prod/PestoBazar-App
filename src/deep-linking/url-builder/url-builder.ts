/**
 * url-builder.ts
 *
 * WHY THIS FILE EXISTS:
 *   Generates shareable deep link URLs for products, categories, search, etc.
 *   Replaces the inline URL construction that currently exists in
 *   app/(stack)/product/[id].tsx (handleShare function).
 *
 *   Having centralized URL builders ensures:
 *   1. All shared links use the same domain and format
 *   2. URL changes only need to be made in one place
 *   3. UTM params and referral codes can be added consistently
 *
 * RESPONSIBILITIES:
 *   - Generate universal link URLs for sharing (https://pestobazaar.com/...)
 *   - Add optional UTM parameters for campaign tracking
 *   - Add optional referral codes
 *   - Generate formatted share messages with product info
 *
 * DEPENDENCIES:
 *   - schemes.ts (UNIVERSAL_LINK_BASE_URL)
 *
 * FUTURE EXTENSION:
 *   - Add short URL generation (integrate with URL shortener service)
 *   - Add OG metadata URLs for social media previews
 *   - Add QR code generation helpers
 */

import { UNIVERSAL_LINK_BASE_URL } from "../constants/schemes";
import type { UTMParams } from "../types/deep-link.types";

// ─── Types ─────────────────────────────────────────────────────────────────────

/**
 * Options for adding tracking params to generated URLs.
 */
interface TrackingOptions {
  /** UTM parameters for campaign tracking */
  utm?: UTMParams;
  /** Referral code to include */
  referralCode?: string;
  /** Coupon code to include */
  couponCode?: string;
}

// ─── URL Builders ──────────────────────────────────────────────────────────────

/**
 * Centralized URL builder for all shareable deep links.
 *
 * NAMING CONVENTION: Each method is named after the route it builds for.
 * All methods return a full URL string (https://pestobazaar.com/...).
 */
export const DeepLinkURLBuilder = {
  /**
   * Generates a product deep link URL.
   *
   * @param productId - The product ID
   * @param slug - Optional product slug for SEO
   * @param tracking - Optional UTM/referral params
   * @returns Full URL: https://pestobazaar.com/product/123?slug=product-name
   *
   * EXAMPLE:
   *   product(123, "organic-fertilizer")
   *   → "https://pestobazaar.com/product/123?slug=organic-fertilizer"
   */
  product(
    productId: number,
    slug?: string,
    tracking?: TrackingOptions,
  ): string {
    const params = new URLSearchParams();
    if (slug) params.set("slug", slug);
    return buildUrl(`/product/${productId}`, params, tracking);
  },

  /**
   * Generates a category deep link URL.
   *
   * @param categoryId - The category ID (used as slug in the route)
   * @param name - Optional category name
   * @param tracking - Optional UTM/referral params
   * @returns Full URL: https://pestobazaar.com/category/4?name=Pesticides
   */
  category(
    categoryId: number,
    name?: string,
    tracking?: TrackingOptions,
  ): string {
    const params = new URLSearchParams();
    if (name) params.set("name", name);
    return buildUrl(`/category/${categoryId}`, params, tracking);
  },

  /**
   * Generates a search/shop deep link URL.
   *
   * @param query - The search query
   * @param tracking - Optional UTM/referral params
   * @returns Full URL: https://pestobazaar.com/shop?search=iphone
   */
  search(
    query: string,
    tracking?: TrackingOptions,
  ): string {
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    return buildUrl("/shop", params, tracking);
  },

  /**
   * Generates a deals page deep link URL.
   *
   * @param tracking - Optional UTM/referral params
   * @returns Full URL: https://pestobazaar.com/deals
   */
  deals(tracking?: TrackingOptions): string {
    return buildUrl("/deals", new URLSearchParams(), tracking);
  },

  /**
   * Generates a custom section deep link URL.
   *
   * @param sectionId - The custom section ID
   * @param title - Optional section title
   * @param tracking - Optional UTM/referral params
   * @returns Full URL: https://pestobazaar.com/section/5?title=New+Arrivals
   */
  section(
    sectionId: number,
    title?: string,
    tracking?: TrackingOptions,
  ): string {
    const params = new URLSearchParams();
    if (title) params.set("title", title);
    return buildUrl(`/section/${sectionId}`, params, tracking);
  },

  /**
   * Generates an order details deep link URL.
   *
   * @param orderId - The order ID
   * @param tracking - Optional UTM/referral params
   * @returns Full URL: https://pestobazaar.com/orderdetails/789
   */
  orderDetails(
    orderId: number,
    tracking?: TrackingOptions,
  ): string {
    return buildUrl(`/orderdetails/${orderId}`, new URLSearchParams(), tracking);
  },

  /**
   * Generates a cart deep link URL.
   *
   * @param tracking - Optional UTM/referral params
   * @returns Full URL: https://pestobazaar.com/cart
   */
  cart(tracking?: TrackingOptions): string {
    return buildUrl("/cart", new URLSearchParams(), tracking);
  },

  /**
   * Generates a referral deep link URL (links to home with referral code).
   *
   * @param referralCode - The referral code
   * @param utm - Optional UTM params
   * @returns Full URL: https://pestobazaar.com/home?ref=FRIEND123
   */
  referral(referralCode: string, utm?: UTMParams): string {
    return buildUrl("/home", new URLSearchParams(), {
      referralCode,
      utm,
    });
  },

  /**
   * Generates a generic shareable message with a URL.
   *
   * @param productName - Name of the product/item being shared
   * @param url - The URL to share
   * @returns Formatted share message
   */
  createShareMessage(productName: string, url: string): string {
    return `Check out ${productName} on PestoBazaar:\n\n${url}`;
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Builds a full URL from path, params, and tracking options.
 *
 * @param path - The URL path (e.g., "/product/123")
 * @param params - Base query parameters
 * @param tracking - Optional tracking params (UTM, referral, coupon)
 * @returns Full URL string
 */
function buildUrl(
  path: string,
  params: URLSearchParams,
  tracking?: TrackingOptions,
): string {
  if (tracking) {
    // Add UTM params
    if (tracking.utm) {
      const utm = tracking.utm;
      if (utm.utm_source) params.set("utm_source", utm.utm_source);
      if (utm.utm_medium) params.set("utm_medium", utm.utm_medium);
      if (utm.utm_campaign) params.set("utm_campaign", utm.utm_campaign);
      if (utm.utm_term) params.set("utm_term", utm.utm_term);
      if (utm.utm_content) params.set("utm_content", utm.utm_content);
    }

    // Add referral code
    if (tracking.referralCode) {
      params.set("ref", tracking.referralCode);
    }

    // Add coupon code
    if (tracking.couponCode) {
      params.set("coupon", tracking.couponCode);
    }
  }

  const queryString = params.toString();
  const fullPath = queryString ? `${path}?${queryString}` : path;

  return `${UNIVERSAL_LINK_BASE_URL}${fullPath}`;
}
