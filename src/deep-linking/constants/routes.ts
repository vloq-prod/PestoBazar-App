/**
 * routes.ts
 *
 * WHY THIS FILE EXISTS:
 *   Single source of truth for ALL deep-linkable routes in the application.
 *   Every route maps an abstract name (used in deep link URLs) to a concrete
 *   Expo Router path, with metadata about auth requirements and parameters.
 *
 * RESPONSIBILITIES:
 *   - Define the route registry (array of RouteConfig)
 *   - Provide lookup helpers for finding routes by name or path pattern
 *   - Declare which routes require authentication
 *   - Declare required and optional parameters for each route
 *
 * DEPENDENCIES:
 *   - deep-link.types.ts (RouteConfig type)
 *
 * FUTURE EXTENSION:
 *   - Add new routes by appending to ROUTE_REGISTRY
 *   - Add feature-flag gated routes by adding a `featureFlag` field to RouteConfig
 *   - No code changes needed in parser/resolver when adding routes
 *
 * HOW TO ADD A NEW ROUTE:
 *   1. Add a new entry to ROUTE_REGISTRY below
 *   2. Add the route name to DEEP_LINK_ROUTE_NAMES
 *   3. The parser, resolver, and guards will automatically pick it up
 */

import type { RouteConfig } from "../types/deep-link.types";

// ─── Route Name Constants ──────────────────────────────────────────────────────

/**
 * Typed route name constants.
 * Using constants instead of raw strings prevents typos and enables
 * autocomplete across the codebase.
 */
export const DEEP_LINK_ROUTE_NAMES = {
  HOME: "home",
  PRODUCT: "product",
  CATEGORY: "category",
  SHOP: "shop",
  SEARCH: "search",
  CART: "cart",
  CHECKOUT: "checkout",
  ORDERS: "orders",
  ORDER_DETAILS: "order_details",
  COUPONS: "coupons",
  DEALS: "deals",
  DIY: "diy",
  PROFILE: "profile",
  USER_PROFILE: "userprofile",
  ADDRESS: "address",
  ADD_ADDRESS: "addaddress",
  RETURNS: "returns",
  RETURN_DETAILS: "return_details",
  RETURN_PRODUCTS: "return_products",
  BULK_ORDER: "bulkorder",
  REVIEWS: "reviews",
  CUSTOM_SECTION: "section",
  VIEW_ALL: "viewall",
  ABOUT: "about",
  TERMS: "terms",
  PRIVACY: "privacy",
  SHIPPING: "shipping",
  NO_INTERNET: "nointernet",
  ORDER_SUCCESS: "ordersuccess",
  WISHLIST: "wishlist",
  NOTIFICATIONS: "notifications",
} as const;

export type DeepLinkRouteName =
  (typeof DEEP_LINK_ROUTE_NAMES)[keyof typeof DEEP_LINK_ROUTE_NAMES];

// ─── Fallback Route ────────────────────────────────────────────────────────────

/**
 * Default route when a deep link cannot be resolved.
 * Falls back to the home tab — safest UX decision because:
 *   1. Home is always accessible (no auth required)
 *   2. User can manually navigate from there
 *   3. Better than showing a blank/error screen
 */
export const FALLBACK_ROUTE = "/(tabs)/" as const;
export const LOGIN_ROUTE = "/(auth)/login" as const;
export const NO_INTERNET_ROUTE = "/(stack)/nointernet" as const;

// ─── Route Registry ───────────────────────────────────────────────────────────

/**
 * The complete registry of all deep-linkable routes.
 *
 * DESIGN DECISIONS:
 *   - `pathPatterns` allows multiple URL patterns to map to one route.
 *     E.g., "product" and "products" and "p" all go to the product screen.
 *     The first pattern is the canonical one used for URL building.
 *
 *   - `requiresAuth` is based on whether the screen accesses user-specific data.
 *     If a screen works for anonymous users, it should NOT require auth.
 *
 *   - `requiredParams` lists params that MUST be present for the route to work.
 *     If a required param is missing, the deep link falls back to home.
 *
 *   - `optionalParams` lists params that enhance the route but aren't mandatory.
 *     E.g., product_name for the product screen — nice for SEO but not required.
 */
export const ROUTE_REGISTRY: readonly RouteConfig[] = [
  // ── Tabs ──────────────────────────────────────────────────────────────────
  {
    name: DEEP_LINK_ROUTE_NAMES.HOME,
    expoPath: "/(tabs)/",
    requiresAuth: false,
    pathPatterns: ["home", ""],
    requiredParams: [],
    optionalParams: [],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.PROFILE,
    expoPath: "/(tabs)/profile",
    requiresAuth: false,
    pathPatterns: ["profile", "account"],
    requiredParams: [],
    optionalParams: [],
  },

  // ── Product & Catalog (Public) ────────────────────────────────────────────
  {
    name: DEEP_LINK_ROUTE_NAMES.PRODUCT,
    expoPath: "/(stack)/products/[slug]",
    requiresAuth: false,
    pathPatterns: ["products", "product", "p"],
    requiredParams: ["slug"],
    optionalParams: ["id", "product_name", "product_slug"],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.CATEGORY,
    expoPath: "/(stack)/category/[slug]",
    requiresAuth: false,
    pathPatterns: ["category", "categories", "cat", "category_detail"],
    requiredParams: [],
    optionalParams: ["slug", "name", "image", "selectedSubCategoryId"],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.SHOP,
    expoPath: "/(stack)/shop",
    requiresAuth: false,
    pathPatterns: ["shop", "listing", "browse"],
    requiredParams: [],
    optionalParams: ["search", "category_slug"],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.SEARCH,
    expoPath: "/(stack)/search",
    requiresAuth: false,
    pathPatterns: ["search", "find"],
    requiredParams: [],
    optionalParams: ["q"],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.DEALS,
    expoPath: "/(stack)/deals",
    requiresAuth: false,
    pathPatterns: ["deals", "offers", "sale"],
    requiredParams: [],
    optionalParams: [],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.DIY,
    expoPath: "/(stack)/diy",
    requiresAuth: false,
    pathPatterns: ["diy"],
    requiredParams: [],
    optionalParams: [],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.REVIEWS,
    expoPath: "/(stack)/reviews/[reviewsid]",
    requiresAuth: false,
    pathPatterns: ["reviews", "review"],
    requiredParams: ["reviewsid"],
    optionalParams: [],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.CUSTOM_SECTION,
    expoPath: "/(stack)/viewall/custom/[id]",
    requiresAuth: false,
    pathPatterns: ["section", "custom_section"],
    requiredParams: ["id"],
    optionalParams: ["title"],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.VIEW_ALL,
    expoPath: "/(stack)/viewall/[all]",
    requiresAuth: false,
    pathPatterns: ["viewall", "view_all"],
    requiredParams: ["all"],
    optionalParams: [],
  },

  // ── Auth-Required Routes ──────────────────────────────────────────────────
  {
    name: DEEP_LINK_ROUTE_NAMES.CART,
    expoPath: "/(stack)/cart",
    requiresAuth: false,
    pathPatterns: ["cart", "basket"],
    requiredParams: [],
    optionalParams: [],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.CHECKOUT,
    expoPath: "/(stack)/checkout",
    requiresAuth: true,
    pathPatterns: ["checkout", "payment"],
    requiredParams: [],
    optionalParams: [],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.ORDERS,
    expoPath: "/(stack)/order",
    requiresAuth: true,
    pathPatterns: ["orders", "order", "my-orders"],
    requiredParams: [],
    optionalParams: [],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.ORDER_DETAILS,
    expoPath: "/(stack)/orderdetails/[id]",
    requiresAuth: true,
    pathPatterns: ["order_details", "orderdetails"],
    requiredParams: ["id"],
    optionalParams: [],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.COUPONS,
    expoPath: "/(stack)/coupons",
    requiresAuth: true,
    pathPatterns: ["coupons", "coupon", "promo"],
    requiredParams: [],
    optionalParams: ["cartId"],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.USER_PROFILE,
    expoPath: "/(stack)/userprofile",
    requiresAuth: true,
    pathPatterns: ["userprofile", "edit-profile"],
    requiredParams: [],
    optionalParams: [],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.ADDRESS,
    expoPath: "/(stack)/address",
    requiresAuth: true,
    pathPatterns: ["address", "addresses"],
    requiredParams: [],
    optionalParams: [],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.ADD_ADDRESS,
    expoPath: "/(stack)/addaddress",
    requiresAuth: true,
    pathPatterns: ["addaddress", "add-address"],
    requiredParams: [],
    optionalParams: [],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.RETURNS,
    expoPath: "/(stack)/returns",
    requiresAuth: true,
    pathPatterns: ["returns"],
    requiredParams: [],
    optionalParams: [],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.RETURN_DETAILS,
    expoPath: "/(stack)/returndetails/[id]",
    requiresAuth: true,
    pathPatterns: ["returndetails", "return_details"],
    requiredParams: ["id"],
    optionalParams: [],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.RETURN_PRODUCTS,
    expoPath: "/(stack)/returnproducts/[id]",
    requiresAuth: true,
    pathPatterns: ["returnproducts", "return_products"],
    requiredParams: ["id"],
    optionalParams: [],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.BULK_ORDER,
    expoPath: "/(stack)/bulkorder",
    requiresAuth: true,
    pathPatterns: ["bulkorder", "bulk-order", "bulk"],
    requiredParams: [],
    optionalParams: [],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.ORDER_SUCCESS,
    expoPath: "/(stack)/ordersuccess",
    requiresAuth: true,
    pathPatterns: ["ordersuccess", "order-success"],
    requiredParams: [],
    optionalParams: [],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.WISHLIST,
    expoPath: "/(stack)/wishlist",
    requiresAuth: true,
    pathPatterns: ["wishlist", "whishlist"],
    requiredParams: [],
    optionalParams: [],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.NOTIFICATIONS,
    expoPath: "/(stack)/notifications",
    requiresAuth: true,
    pathPatterns: ["notifications", "notification"],
    requiredParams: [],
    optionalParams: [],
  },

  // ── Static / Content Pages (Public) ───────────────────────────────────────
  {
    name: DEEP_LINK_ROUTE_NAMES.ABOUT,
    expoPath: "/(stack)/about",
    requiresAuth: false,
    pathPatterns: ["about", "about-us"],
    requiredParams: [],
    optionalParams: [],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.TERMS,
    expoPath: "/(stack)/terms",
    requiresAuth: false,
    pathPatterns: ["terms", "terms-and-conditions", "tos"],
    requiredParams: [],
    optionalParams: [],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.PRIVACY,
    expoPath: "/(stack)/privacy",
    requiresAuth: false,
    pathPatterns: ["privacy", "privacy-policy"],
    requiredParams: [],
    optionalParams: [],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.SHIPPING,
    expoPath: "/(stack)/shipping",
    requiresAuth: false,
    pathPatterns: ["shipping", "shipping-policy", "cancellation"],
    requiredParams: [],
    optionalParams: [],
  },
  {
    name: DEEP_LINK_ROUTE_NAMES.NO_INTERNET,
    expoPath: "/(stack)/nointernet",
    requiresAuth: false,
    pathPatterns: ["nointernet", "offline"],
    requiredParams: [],
    optionalParams: [],
  },
] as const;

// ─── Lookup Helpers ────────────────────────────────────────────────────────────

/**
 * Builds a Map from path pattern → RouteConfig for O(1) lookup.
 * Created once at module load time — no runtime cost on subsequent lookups.
 *
 * WHY MAP (not linear search):
 *   With 27+ routes × multiple patterns each, linear search on every
 *   deep link is wasteful. A pre-built Map gives constant-time lookup.
 */
const _pathPatternMap = new Map<string, RouteConfig>();

for (const route of ROUTE_REGISTRY) {
  for (const pattern of route.pathPatterns) {
    _pathPatternMap.set(pattern.toLowerCase(), route);
  }
}

/**
 * Finds a RouteConfig by matching a URL path segment against registered patterns.
 *
 * @param pathSegment - The first path segment from the URL (e.g., "product" from "/product/123")
 * @returns The matching RouteConfig, or undefined if no match
 *
 * EDGE CASES:
 *   - Empty string maps to HOME route
 *   - Case-insensitive matching (URLs are case-insensitive by convention)
 *   - Returns undefined for truly unknown routes (caller decides fallback)
 */
export function findRouteByPathPattern(
  pathSegment: string,
): RouteConfig | undefined {
  return _pathPatternMap.get(pathSegment.toLowerCase());
}

/**
 * Finds a RouteConfig by its abstract name.
 *
 * @param name - The route name (e.g., "product", "cart")
 * @returns The matching RouteConfig, or undefined if no match
 */
export function findRouteByName(name: string): RouteConfig | undefined {
  return ROUTE_REGISTRY.find((r) => r.name === name.toLowerCase());
}
