/**
 * guards.ts
 *
 * WHY THIS FILE EXISTS:
 *   Declares guard metadata constants (names, execution order).
 *   Keeps guard configuration separate from guard implementation
 *   so the pipeline can be reconfigured without touching guard logic.
 *
 * RESPONSIBILITIES:
 *   - Define guard name constants
 *   - Define the default guard execution order
 *
 * DEPENDENCIES: None (pure constants)
 *
 * FUTURE EXTENSION:
 *   - Add MAINTENANCE_GUARD, VERSION_GUARD, FEATURE_FLAG_GUARD
 *   - Add per-route guard overrides if certain routes skip certain guards
 */

/**
 * Guard name constants — used for logging, analytics, and pipeline configuration.
 * Using constants prevents typos and enables rename refactoring.
 */
export const GUARD_NAMES = {
  NETWORK: "NetworkGuard",
  AUTH: "AuthGuard",
} as const;

/**
 * Default execution order of guards.
 *
 * WHY THIS ORDER:
 *   1. Network first — no point checking auth if we're offline
 *   2. Auth last — only runs if we have connectivity
 *
 * The pipeline will short-circuit on the first BLOCK or REDIRECT result.
 */
export const DEFAULT_GUARD_ORDER: readonly string[] = [
  GUARD_NAMES.NETWORK,
  GUARD_NAMES.AUTH,
] as const;

/**
 * Pending navigation expiry time in milliseconds.
 * After this duration, a stored pending navigation is considered stale
 * and will be discarded instead of resumed.
 *
 * WHY 30 MINUTES:
 *   - Long enough for a user to complete login (including OTP)
 *   - Short enough that the deep link target is likely still relevant
 *   - Prevents stale navigations from confusing users days later
 */
export const PENDING_NAVIGATION_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes
