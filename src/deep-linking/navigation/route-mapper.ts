import type {
  DeepLinkPayload,
  NavigationInstruction,
} from "../types/deep-link.types";
import {
  findRouteByName,
  FALLBACK_ROUTE,
  DEEP_LINK_ROUTE_NAMES,
} from "../constants/routes";

export function mapPayloadToNavigation(
  payload: DeepLinkPayload,
): NavigationInstruction {
  const routeConfig = findRouteByName(payload.routeName);

  if (!routeConfig) {
    console.warn(
      `[RouteMapper] No route config for "${payload.routeName}". Falling back to home.`,
    );
    return { pathname: FALLBACK_ROUTE, params: {} };
  }

  const params = buildRouteParams(payload);

  // If the category route is requested but no valid slug/id is provided (or it is "0"),
  // navigate to the Category Tab in bottom navigation instead.
  if (
    payload.routeName === DEEP_LINK_ROUTE_NAMES.CATEGORY &&
    (!params.slug || params.slug === "0")
  ) {
    return {
      pathname: "/(tabs)/category",
      params: {},
    };
  }

  return {
    pathname: routeConfig.expoPath,
    params,
  };
}

function buildRouteParams(
  payload: DeepLinkPayload,
): Record<string, string | number> {
  const { routeName, id, slug, queryParams } = payload;

  switch (routeName) {
    // ── Product ───────────────────────────────────────────────────────────
    case DEEP_LINK_ROUTE_NAMES.PRODUCT: {
      const params: Record<string, string | number> = {};
      if (id) params.id = id;
      const actualSlug =
        slug || (queryParams.product_slug as string) || undefined;
      if (actualSlug) {
        params.slug = actualSlug;
        params.product_slug = actualSlug;
      }
      if (queryParams.product_name)
        params.product_name = queryParams.product_name;
      return params;
    }

    // ── Category ──────────────────────────────────────────────────────────
    case DEEP_LINK_ROUTE_NAMES.CATEGORY: {
      const params: Record<string, string | number> = {};
      // Category uses [slug] as the dynamic segment, but it's actually an ID
      if (id) params.slug = id;
      if (slug) params.slug = slug;
      if (queryParams.name) params.name = queryParams.name;
      if (queryParams.image) params.image = queryParams.image;
      if (queryParams.selectedSubCategoryId) {
        params.selectedSubCategoryId = queryParams.selectedSubCategoryId;
      }
      return params;
    }

    // ── Shop (Listing) ────────────────────────────────────────────────────
    case DEEP_LINK_ROUTE_NAMES.SHOP: {
      const params: Record<string, string | number> = {};
      if (queryParams.search || queryParams.q) {
        params.search = queryParams.search || queryParams.q;
      }
      if (queryParams.category_slug || slug) {
        params.category_slug = queryParams.category_slug || slug || "";
      }
      return params;
    }

    // ── Search ────────────────────────────────────────────────────────────
    case DEEP_LINK_ROUTE_NAMES.SEARCH:
      return {};

    // ── Order Details ─────────────────────────────────────────────────────
    case DEEP_LINK_ROUTE_NAMES.ORDER_DETAILS: {
      const params: Record<string, string | number> = {};
      if (id) params.id = id;
      return params;
    }

    // ── Return Details ────────────────────────────────────────────────────
    case DEEP_LINK_ROUTE_NAMES.RETURN_DETAILS: {
      const params: Record<string, string | number> = {};
      if (id) params.id = id;
      return params;
    }

    // ── Return Products ───────────────────────────────────────────────────
    case DEEP_LINK_ROUTE_NAMES.RETURN_PRODUCTS: {
      const params: Record<string, string | number> = {};
      if (id) params.id = id;
      return params;
    }

    // ── Reviews ───────────────────────────────────────────────────────────
    case DEEP_LINK_ROUTE_NAMES.REVIEWS: {
      const params: Record<string, string | number> = {};
      if (id) params.reviewsid = id;
      return params;
    }

    // ── Custom Section ────────────────────────────────────────────────────
    case DEEP_LINK_ROUTE_NAMES.CUSTOM_SECTION: {
      const params: Record<string, string | number> = {};
      if (id) params.id = id;
      if (queryParams.title) params.title = queryParams.title;
      return params;
    }

    // ── View All ──────────────────────────────────────────────────────────
    case DEEP_LINK_ROUTE_NAMES.VIEW_ALL: {
      const params: Record<string, string | number> = {};
      if (slug) params.all = slug;
      if (id) params.all = id;
      if (queryParams.title) params.title = queryParams.title;
      return params;
    }

    // ── Coupons ───────────────────────────────────────────────────────────
    case DEEP_LINK_ROUTE_NAMES.COUPONS: {
      const params: Record<string, string | number> = {};
      if (queryParams.cartId) params.cartId = queryParams.cartId;
      return params;
    }

    // ── Routes with no params ─────────────────────────────────────────────
    case DEEP_LINK_ROUTE_NAMES.HOME:
    case DEEP_LINK_ROUTE_NAMES.CART:
    case DEEP_LINK_ROUTE_NAMES.CHECKOUT:
    case DEEP_LINK_ROUTE_NAMES.ORDERS:
    case DEEP_LINK_ROUTE_NAMES.DEALS:
    case DEEP_LINK_ROUTE_NAMES.DIY:
    case DEEP_LINK_ROUTE_NAMES.PROFILE:
    case DEEP_LINK_ROUTE_NAMES.USER_PROFILE:
    case DEEP_LINK_ROUTE_NAMES.ADDRESS:
    case DEEP_LINK_ROUTE_NAMES.ADD_ADDRESS:
    case DEEP_LINK_ROUTE_NAMES.RETURNS:
    case DEEP_LINK_ROUTE_NAMES.BULK_ORDER:
    case DEEP_LINK_ROUTE_NAMES.ORDER_SUCCESS:
    case DEEP_LINK_ROUTE_NAMES.WISHLIST:
    case DEEP_LINK_ROUTE_NAMES.NOTIFICATIONS:
    case DEEP_LINK_ROUTE_NAMES.ABOUT:
    case DEEP_LINK_ROUTE_NAMES.TERMS:
    case DEEP_LINK_ROUTE_NAMES.PRIVACY:
    case DEEP_LINK_ROUTE_NAMES.SHIPPING:
    case DEEP_LINK_ROUTE_NAMES.NO_INTERNET:
      return {};

    // ── Unknown/Default ───────────────────────────────────────────────────
    default:
      return {};
  }
}
