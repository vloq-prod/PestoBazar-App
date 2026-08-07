/**
 * deep-link.types.ts
 *
 * WHY THIS FILE EXISTS:
 *   Single source of truth for every type used across the deep-linking module.
 *   Keeping all types co-located prevents circular imports and makes it trivial
 *   to find/update any deep-linking contract.
 *
 * RESPONSIBILITIES:
 *   - Define the shape of parsed deep link payloads
 *   - Define guard results and validation results
 *   - Define route configuration contracts
 *   - Define analytics event shapes
 *   - Define notification data normalization contracts
 *
 * DEPENDENCIES: None (pure type file)
 *
 * FUTURE EXTENSION:
 *   - Add new route param types as screens are added
 *   - Add new guard result types for feature-flag guards, version guards, etc.
 *   - Add A/B test variant tracking to analytics types
 */

// ─── Deep Link Source ──────────────────────────────────────────────────────────

/**
 * Describes WHERE a deep link originated from.
 * Used for analytics attribution and debugging.
 */
export type DeepLinkSource =
  | "custom_scheme"       // pestobazaar://...
  | "universal_link"      // https://pestobazaar.com/...
  | "notification"        // FCM push notification tap
  | "in_app"              // Programmatic navigation within the app
  | "unknown";            // Fallback for unidentifiable sources

// ─── UTM Parameters ───────────────────────────────────────────────────────────

/**
 * Standard UTM tracking parameters extracted from deep link query strings.
 *
 * WHY SEPARATE TYPE:
 *   UTM params are always optional and only relevant for analytics.
 *   Keeping them in their own type prevents polluting the main payload.
 */
export interface UTMParams {
  readonly utm_source?: string;    // e.g., "instagram", "google", "email"
  readonly utm_medium?: string;    // e.g., "social", "cpc", "banner"
  readonly utm_campaign?: string;  // e.g., "diwali_sale_2024"
  readonly utm_term?: string;      // e.g., "organic_pesticide"
  readonly utm_content?: string;   // e.g., "hero_banner_v2"
}

// ─── Deep Link Payload ─────────────────────────────────────────────────────────

/**
 * The canonical representation of a parsed deep link.
 * ALL deep link entry points (URL, notification, in-app) are normalized
 * into this shape before being processed by the resolver pipeline.
 *
 * WHY ONE CANONICAL TYPE:
 *   Having a single payload type means the guard pipeline, navigation router,
 *   and analytics tracker all work with the same contract. No adapter logic
 *   is needed between pipeline stages.
 *
 * BUSINESS LOGIC:
 *   - `routeName` is the abstract route identifier (e.g., "product", "cart")
 *   - `id` is the primary resource identifier (product ID, order ID, etc.)
 *   - `slug` is the SEO-friendly URL segment (product_slug, category_slug)
 *   - `queryParams` captures ALL query parameters as raw key-value pairs
 *   - `utm` captures standard UTM tracking params (subset of queryParams)
 *   - `couponCode` / `referralCode` are first-class because they affect business logic
 */
export interface DeepLinkPayload {
  /** The raw URL or notification data string that was received */
  readonly rawInput: string;

  /** Where this deep link came from */
  readonly source: DeepLinkSource;

  /** Abstract route name — maps to a key in the route registry */
  readonly routeName: string;

  /** Primary resource ID (numeric). E.g., product ID, order ID */
  readonly id?: number;

  /** SEO-friendly slug. E.g., product_slug, category_slug */
  readonly slug?: string;

  /** All query parameters as raw key-value pairs */
  readonly queryParams: Record<string, string>;

  /** UTM tracking parameters (extracted from queryParams) */
  readonly utm: UTMParams;

  /** Coupon code from ?coupon=SALE50 */
  readonly couponCode?: string;

  /** Referral code from ?ref=FRIEND123 */
  readonly referralCode?: string;

  /** Timestamp when this deep link was received */
  readonly receivedAt: number;
}

// ─── Validation ────────────────────────────────────────────────────────────────

/**
 * Outcome of URL validation.
 *
 * WHY isValid + errors ARRAY:
 *   A single URL can fail multiple validation rules simultaneously
 *   (e.g., invalid scheme AND path traversal). Collecting all errors
 *   enables better debugging and analytics.
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly ValidationError[];
}

export interface ValidationError {
  readonly code: ValidationErrorCode;
  readonly message: string;
}

export type ValidationErrorCode =
  | "INVALID_URL"          // URL cannot be parsed at all
  | "INVALID_SCHEME"       // Scheme is not in the allowed list
  | "INVALID_HOST"         // Host doesn't match known domains
  | "PATH_TRAVERSAL"       // Detected ../ or similar injection
  | "PARAM_TOO_LONG"       // A query param exceeds max length
  | "DANGEROUS_CHARS"      // Script tags, encoded entities, etc.
  | "UNKNOWN_ROUTE"        // Route name not found in registry
  | "MISSING_REQUIRED_PARAM"; // A required param is absent

// ─── Guards ────────────────────────────────────────────────────────────────────

/**
 * Guard action determines what happens after a guard evaluates.
 *
 * WHY THREE STATES (not boolean):
 *   A guard can allow, block (show error), or redirect (to login, no-internet, etc.).
 *   A boolean can't express "redirect to login" vs "show 404".
 */
export type GuardAction = "ALLOW" | "BLOCK" | "REDIRECT";

/**
 * Result returned by every guard in the pipeline.
 *
 * DESIGN:
 *   - `action: ALLOW` → continue to next guard or navigate
 *   - `action: REDIRECT` → navigate to `redirectTo` instead
 *   - `action: BLOCK` → show error with `reason`
 */
export interface GuardResult {
  readonly action: GuardAction;
  /** Expo Router path to redirect to (only when action is REDIRECT) */
  readonly redirectTo?: string;
  /** Human-readable reason for blocking/redirecting (for logging) */
  readonly reason?: string;
}

/**
 * Contract for a single guard function.
 *
 * WHY FUNCTION TYPE (not class):
 *   Guards are pure functions with no internal state. Using functions makes
 *   them trivially composable and testable. No DI container needed.
 *
 * @param payload - The parsed deep link payload being evaluated
 * @returns GuardResult indicating whether to allow, block, or redirect
 */
export type Guard = (payload: DeepLinkPayload) => GuardResult;

// ─── Route Configuration ──────────────────────────────────────────────────────

/**
 * Configuration for a single deep-linkable route.
 *
 * WHY A REGISTRY (not hardcoded paths):
 *   - Adding a new route is a single object addition
 *   - Auth requirements are declared, not scattered across components
 *   - Route-to-path mapping is centralized and type-safe
 *   - The parser can validate routes against the registry
 */
export interface RouteConfig {
  /** Abstract name used in deep links. E.g., "product", "cart" */
  readonly name: string;

  /** Expo Router pathname. E.g., "/(stack)/product/[id]" */
  readonly expoPath: string;

  /** Whether this route requires an authenticated user (userId exists) */
  readonly requiresAuth: boolean;

  /**
   * List of deep link path patterns that match this route.
   * E.g., ["product", "products", "p"] all map to the product route.
   * First element is the canonical pattern used for URL building.
   */
  readonly pathPatterns: readonly string[];

  /**
   * Names of required parameters for this route.
   * E.g., ["id"] for product detail, [] for cart.
   */
  readonly requiredParams: readonly string[];

  /**
   * Names of optional parameters for this route.
   * E.g., ["product_slug", "product_name"] for product detail.
   */
  readonly optionalParams: readonly string[];
}

// ─── Navigation ────────────────────────────────────────────────────────────────

/**
 * The final navigation instruction passed to Expo Router.
 *
 * WHY SEPARATE FROM DeepLinkPayload:
 *   The payload is the parsed input; the instruction is the output
 *   after guard evaluation and route mapping. They have different shapes.
 */
export interface NavigationInstruction {
  /** Expo Router pathname. E.g., "/(stack)/product/[id]" */
  readonly pathname: string;
  /** Params to pass to the route */
  readonly params: Record<string, string | number>;
}

// ─── Pending Navigation ────────────────────────────────────────────────────────

/**
 * Represents a navigation that was deferred because the user
 * wasn't authenticated. Stored in Zustand + SecureStore to survive app kill.
 */
export interface PendingNavigation {
  /** The deep link payload that triggered the navigation */
  readonly payload: DeepLinkPayload;
  /** When the pending navigation was stored */
  readonly storedAt: number;
  /** Maximum age in ms before this pending nav expires (default: 30 min) */
  readonly maxAge: number;
}

// ─── Analytics ─────────────────────────────────────────────────────────────────

/**
 * Analytics event for a deep link open.
 *
 * BUSINESS LOGIC:
 *   Every deep link open is tracked with source attribution.
 *   This enables measuring ROI of push campaigns, social shares, etc.
 */
export interface DeepLinkAnalyticsEvent {
  /** Type of event */
  readonly eventName: "deep_link_opened" | "deep_link_failed" | "deep_link_guarded";
  /** The route that was targeted */
  readonly routeName: string;
  /** Where the deep link came from */
  readonly source: DeepLinkSource;
  /** UTM parameters if present */
  readonly utm: UTMParams;
  /** Whether the link was valid */
  readonly isValid: boolean;
  /** Whether auth was required */
  readonly authRequired: boolean;
  /** Whether the user was authenticated at the time */
  readonly wasAuthenticated: boolean;
  /** Guard that blocked (if any) */
  readonly blockedBy?: string;
  /** Error codes if validation failed */
  readonly validationErrors?: readonly string[];
  /** Timestamp */
  readonly timestamp: number;
}

// ─── Notification Data ─────────────────────────────────────────────────────────

/**
 * Raw notification data shape from FCM.
 * Uses Record<string, any> because backend can send arbitrary fields.
 *
 * KNOWN FIELDS (from current NotificationProvider.tsx):
 *   - route: explicit Expo Router path
 *   - type / redirect_type / app_redirect_key: route type identifier
 *   - id / product_slug / slug: resource identifiers
 *   - title / product_name: display names
 *   - order_id: order identifier
 *   - category_slug: category identifier
 *   - section_id: custom section identifier
 */
export type NotificationData = Record<string, unknown>;
