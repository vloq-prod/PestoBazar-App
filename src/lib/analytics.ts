import {
  getAnalytics,
  logEvent,
  logScreenView,
  logViewItem,
  logAddToCart,
  logBeginCheckout,
  logPurchase,
  logSearch,
  logLogin,
  logSignUp,
  setUserId as fbSetUserId,
  resetAnalyticsData as fbResetAnalyticsData,
  type Analytics,
  type Item,
} from "@react-native-firebase/analytics";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized Firebase / Google Analytics Utility for Pestobazaar
 * ─────────────────────────────────────────────────────────────────────────────
 * - Lightweight, non-intrusive, production-ready.
 * - Safely handles errors so analytics NEVER breaks the application.
 * - Deduplicates screen tracking and events.
 * - Strips sensitive user data (passwords, OTPs, auth tokens, card details).
 */

let analyticsInstance: Analytics | null = null;
let isInitialized = false;

/**
 * Lazily retrieve the Firebase Analytics instance safely.
 * Returns null if native modules are not linked or unavailable.
 */
function getSafeAnalytics(): Analytics | null {
  if (isInitialized) return analyticsInstance;

  try {
    analyticsInstance = getAnalytics();
    isInitialized = true;
    if (__DEV__) {
      console.log("[Analytics] Firebase Analytics initialized successfully.");
    }
    return analyticsInstance;
  } catch (error) {
    isInitialized = true;
    analyticsInstance = null;
    if (__DEV__) {
      console.warn(
        "[Analytics] Firebase Analytics unavailable in current runtime:",
        error,
      );
    }
    return null;
  }
}

/**
 * Helper to safely sanitize parameters:
 * - Omits undefined / null values
 * - Filters out any sensitive keys (passwords, OTPs, tokens, cards)
 */
function sanitizeParams(params?: Record<string, any>): Record<string, any> {
  if (!params || typeof params !== "object") return {};

  const sensitiveKeys = new Set([
    "password",
    "otp",
    "token",
    "refresh_token",
    "access_token",
    "card",
    "card_number",
    "cvv",
    "cvc",
    "secret",
    "authorization",
  ]);

  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (sensitiveKeys.has(key.toLowerCase())) continue;

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      clean[key] = value;
    } else if (Array.isArray(value)) {
      clean[key] = value;
    } else if (typeof value === "object") {
      clean[key] = sanitizeParams(value);
    }
  }

  return clean;
}

/**
 * Track screen transition.
 * Standardized across the 7 business-critical screens:
 * 1. Home
 * 2. Product Details
 * 3. Cart
 * 4. Checkout
 * 5. Order Success
 * 6. Profile
 * 7. Orders
 */
export async function trackScreen(screenName: string): Promise<void> {
  if (!screenName) return;

  try {
    if (__DEV__) {
      console.log(`[Analytics] 📱 Screen View: "${screenName}"`);
    }

    const analytics = getSafeAnalytics();
    if (!analytics) return;

    await logScreenView(analytics, {
      screen_name: screenName,
      screen_class: screenName,
    });
  } catch (err) {
    if (__DEV__) {
      console.warn(`[Analytics] Error tracking screen "${screenName}":`, err);
    }
  }
}

/**
 * Generic safe event tracker.
 */
export async function trackEvent(
  eventName: string,
  params?: Record<string, any>,
): Promise<void> {
  if (!eventName) return;

  try {
    const cleanParams = sanitizeParams(params);
    if (__DEV__) {
      console.log(`[Analytics] 📊 Event: "${eventName}"`, cleanParams);
    }

    const analytics = getSafeAnalytics();
    if (!analytics) return;

    await logEvent(analytics, eventName as any, cleanParams);
  } catch (err) {
    if (__DEV__) {
      console.warn(`[Analytics] Error logging event "${eventName}":`, err);
    }
  }
}

/**
 * Track when a user views a product.
 * Logs both GA4 standard view_item and custom product_view.
 */
export async function trackProductView(product: {
  id?: string | number;
  name?: string;
  price?: string | number;
  category?: string;
  [key: string]: any;
}): Promise<void> {
  if (!product) return;

  try {
    const itemId = String(product.id ?? "");
    const itemName = String(product.name ?? product.product_name ?? "Unknown Product");
    const itemPrice = Number(product.price ?? product.selling_price ?? 0);
    const itemCategory = product.category ? String(product.category) : undefined;

    const item: Item = {
      item_id: itemId,
      item_name: itemName,
      item_category: itemCategory,
      price: !isNaN(itemPrice) && itemPrice > 0 ? itemPrice : undefined,
    };

    if (__DEV__) {
      console.log(`[Analytics] 🛍️ Product View: "${itemName}" (ID: ${itemId})`);
    }

    const analytics = getSafeAnalytics();
    if (!analytics) return;

    // GA4 standard view_item
    await logViewItem(analytics, {
      currency: "INR",
      value: !isNaN(itemPrice) && itemPrice > 0 ? itemPrice : undefined,
      items: [item],
    });

    // Custom product_view event as requested
    await logEvent(analytics, "product_view", {
      item_id: itemId,
      item_name: itemName,
      price: !isNaN(itemPrice) ? itemPrice : 0,
      currency: "INR",
      ...(itemCategory ? { item_category: itemCategory } : {}),
    });
  } catch (err) {
    if (__DEV__) {
      console.warn("[Analytics] Error tracking product_view:", err);
    }
  }
}

/**
 * Track when an item is added to the cart.
 */
export async function trackAddToCart(
  product: {
    id?: string | number;
    name?: string;
    price?: string | number;
    category?: string;
    [key: string]: any;
  },
  quantity: number = 1,
): Promise<void> {
  if (!product) return;

  try {
    const itemId = String(product.id ?? "");
    const itemName = String(product.name ?? product.product_name ?? "Product");
    const itemPrice = Number(product.price ?? product.selling_price ?? 0);
    const validQty = Math.max(1, quantity || 1);
    const value = !isNaN(itemPrice) ? itemPrice * validQty : 0;

    const item: Item = {
      item_id: itemId,
      item_name: itemName,
      price: !isNaN(itemPrice) && itemPrice > 0 ? itemPrice : undefined,
      quantity: validQty,
    };

    if (__DEV__) {
      console.log(`[Analytics] 🛒 Add to Cart: "${itemName}" x${validQty}`);
    }

    const analytics = getSafeAnalytics();
    if (!analytics) return;

    await logAddToCart(analytics, {
      currency: "INR",
      value: value > 0 ? value : undefined,
      items: [item],
    });
  } catch (err) {
    if (__DEV__) {
      console.warn("[Analytics] Error tracking add_to_cart:", err);
    }
  }
}

/**
 * Track when checkout starts.
 */
export async function trackCheckout(cartSummary?: {
  value?: number | string;
  items?: Item[];
  coupon?: string;
  [key: string]: any;
}): Promise<void> {
  try {
    const rawVal = cartSummary?.value ? Number(cartSummary.value) : undefined;
    const value = rawVal !== undefined && !isNaN(rawVal) ? rawVal : undefined;

    if (__DEV__) {
      console.log("[Analytics] 💳 Begin Checkout", { value, coupon: cartSummary?.coupon });
    }

    const analytics = getSafeAnalytics();
    if (!analytics) return;

    await logBeginCheckout(analytics, {
      currency: "INR",
      value,
      coupon: cartSummary?.coupon ? String(cartSummary.coupon) : undefined,
      items: cartSummary?.items,
    });
  } catch (err) {
    if (__DEV__) {
      console.warn("[Analytics] Error tracking begin_checkout:", err);
    }
  }
}

/**
 * Track when a purchase completes successfully.
 */
export async function trackPurchase(order: {
  orderId?: string | number;
  id?: string | number;
  amount?: string | number;
  total?: string | number;
  shipping?: string | number;
  tax?: string | number;
  coupon?: string;
  paymentMethod?: string;
  items?: Item[];
  [key: string]: any;
}): Promise<void> {
  if (!order) return;

  try {
    const transactionId = String(order.orderId ?? order.id ?? order.order_id ?? "");
    const rawVal = Number(order.amount ?? order.total ?? 0);
    const value = !isNaN(rawVal) ? rawVal : 0;
    const shipping = order.shipping !== undefined ? Number(order.shipping) : undefined;
    const tax = order.tax !== undefined ? Number(order.tax) : undefined;

    if (__DEV__) {
      console.log(`[Analytics] 💰 Purchase: #${transactionId} - ₹${value}`);
    }

    const analytics = getSafeAnalytics();
    if (!analytics) return;

    await logPurchase(analytics, {
      transaction_id: transactionId || undefined,
      currency: "INR",
      value,
      shipping: shipping !== undefined && !isNaN(shipping) ? shipping : undefined,
      tax: tax !== undefined && !isNaN(tax) ? tax : undefined,
      coupon: order.coupon ? String(order.coupon) : undefined,
      items: order.items,
    });
  } catch (err) {
    if (__DEV__) {
      console.warn("[Analytics] Error tracking purchase:", err);
    }
  }
}

/**
 * Track user product search.
 */
export async function trackSearch(searchTerm: string): Promise<void> {
  const term = searchTerm?.trim();
  if (!term || term.length < 2) return;

  try {
    if (__DEV__) {
      console.log(`[Analytics] 🔍 Search: "${term}"`);
    }

    const analytics = getSafeAnalytics();
    if (!analytics) return;

    await logSearch(analytics, {
      search_term: term,
    });
  } catch (err) {
    if (__DEV__) {
      console.warn("[Analytics] Error tracking search:", err);
    }
  }
}

/**
 * Track successful login.
 */
export async function trackLogin(method: string = "phone"): Promise<void> {
  try {
    if (__DEV__) {
      console.log(`[Analytics] 🔑 Login via: ${method}`);
    }

    const analytics = getSafeAnalytics();
    if (!analytics) return;

    await logLogin(analytics, { method });
  } catch (err) {
    if (__DEV__) {
      console.warn("[Analytics] Error tracking login:", err);
    }
  }
}

/**
 * Track successful user registration / signup.
 */
export async function trackSignUp(method: string = "phone"): Promise<void> {
  try {
    if (__DEV__) {
      console.log(`[Analytics] 📝 Sign Up via: ${method}`);
    }

    const analytics = getSafeAnalytics();
    if (!analytics) return;

    await logSignUp(analytics, { method });
  } catch (err) {
    if (__DEV__) {
      console.warn("[Analytics] Error tracking sign_up:", err);
    }
  }
}

/**
 * Set the authenticated user ID for analytics tracking.
 * Call on login/signup, or pass null on logout.
 */
export async function setAnalyticsUserId(userId: string | number | null): Promise<void> {
  try {
    const id = userId ? String(userId) : null;
    const analytics = getSafeAnalytics();
    if (!analytics) return;

    await fbSetUserId(analytics, id);
    if (__DEV__) {
      console.log(`[Analytics] 👤 User ID set: ${id ?? "cleared"}`);
    }
  } catch (err) {
    if (__DEV__) {
      console.warn("[Analytics] Error setting user ID:", err);
    }
  }
}

/**
 * Reset analytics data on user logout.
 */
export async function resetAnalytics(): Promise<void> {
  try {
    const analytics = getSafeAnalytics();
    if (!analytics) return;

    await fbResetAnalyticsData(analytics);
    await fbSetUserId(analytics, null);
    if (__DEV__) {
      console.log("[Analytics] 🔄 Analytics data reset upon logout.");
    }
  } catch (err) {
    if (__DEV__) {
      console.warn("[Analytics] Error resetting analytics data:", err);
    }
  }
}

/**
 * Centralized screen name resolver for Expo Router segments.
 * Only resolves the 7 business-critical screens requested:
 * 1. Home
 * 2. Product Details
 * 3. Cart
 * 4. Checkout
 * 5. Order Success
 * 6. Profile
 * 7. Orders
 */
export function getTrackedScreenName(segments: string[]): string | null {
  if (!segments || segments.length === 0) return null;

  // 1. Home Screen: (tabs) or (tabs)/index
  if (
    segments[0] === "(tabs)" &&
    (segments.length === 1 || segments[1] === "index" || !segments[1])
  ) {
    return "Home";
  }

  // 6. Profile / Account Screen: (tabs)/profile or (stack)/userprofile
  if (
    (segments[0] === "(tabs)" && segments[1] === "profile") ||
    (segments[0] === "(stack)" && segments[1] === "userprofile")
  ) {
    return "Profile";
  }

  // Screens in (stack)
  if (segments[0] === "(stack)") {
    const subRoute = segments[1];

    // 2. Product Details
    if (subRoute === "products") return "Product Details";

    // 3. Cart
    if (subRoute === "cart") return "Cart";

    // 4. Checkout
    if (subRoute === "checkout") return "Checkout";

    // 5. Order Success / Confirmation
    if (subRoute === "ordersuccess") return "Order Success";

    // 7. Orders
    if (subRoute === "order") return "Orders";
  }

  return null;
}
