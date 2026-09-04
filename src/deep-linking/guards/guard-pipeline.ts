/**
 * guard-pipeline.ts
 *
 * WHY THIS FILE EXISTS:
 *   Orchestrates the execution of multiple guards in sequence using the
 *   Chain of Responsibility pattern. Each guard independently decides
 *   ALLOW/BLOCK/REDIRECT, and the pipeline short-circuits on the first
 *   non-ALLOW result.
 *
 * RESPONSIBILITIES:
 *   - Run guards in the configured order
 *   - Short-circuit on first BLOCK or REDIRECT
 *   - Return the final GuardResult
 *   - Log which guard blocked/redirected (for debugging)
 *
 * DEPENDENCIES:
 *   - deep-link.types.ts (Guard, GuardResult, DeepLinkPayload)
 *   - auth-guard.ts (createAuthGuard)
 *   - network-guard.ts (createNetworkGuard)
 *
 * DESIGN DECISIONS:
 *   - Guards are pure functions, not classes. No DI container needed.
 *     WHY: Simpler, no class instantiation overhead, trivially composable.
 *
 *   - Pipeline is created once at module load time (lazy singleton).
 *     WHY: Guards don't change at runtime. Creating them once is efficient.
 *
 *   - Short-circuit on first non-ALLOW.
 *     WHY: No point checking auth if there's no network.
 *
 * FUTURE EXTENSION:
 *   - Add MaintenanceGuard (check if backend is in maintenance mode)
 *   - Add VersionGuard (check if app version is still supported)
 *   - Add FeatureFlagGuard (check if route's feature is enabled)
 *   - Add per-route guard overrides (some routes skip certain guards)
 */

import type { Guard, GuardResult, DeepLinkPayload } from "../types/deep-link.types";
import { createAuthGuard } from "./auth-guard";
import { createNetworkGuard } from "./network-guard";
import { GUARD_NAMES } from "../constants/guards";

// ─── Guard Registry ────────────────────────────────────────────────────────────

/**
 * Named guard entry for logging and analytics.
 */
interface NamedGuard {
  readonly name: string;
  readonly guard: Guard;
}

/**
 * Extended guard result that includes which guard produced it.
 */
export interface PipelineResult extends GuardResult {
  /** Name of the guard that blocked/redirected, or undefined if all passed */
  readonly guardName?: string;
}

// ─── Pipeline ──────────────────────────────────────────────────────────────────

/**
 * The ordered list of guards to run.
 * Created lazily on first call to avoid circular import issues.
 */
let _guards: NamedGuard[] | null = null;

function getGuards(): NamedGuard[] {
  if (!_guards) {
    _guards = [
      { name: GUARD_NAMES.NETWORK, guard: createNetworkGuard() },
      { name: GUARD_NAMES.AUTH, guard: createAuthGuard() },
    ];
  }
  return _guards;
}

/**
 * Runs all guards in sequence against a deep link payload.
 *
 * @param payload - The parsed and validated deep link payload
 * @returns PipelineResult with the combined outcome
 *
 * FLOW:
 *   1. Iterate guards in order (Network → Auth)
 *   2. Call each guard with the payload
 *   3. If guard returns ALLOW → continue to next guard
 *   4. If guard returns BLOCK or REDIRECT → stop and return that result
 *   5. If all guards return ALLOW → return ALLOW
 *
 * EDGE CASES:
 *   - No guards configured → returns ALLOW (fail-open)
 *   - Guard throws exception → catches and returns BLOCK (fail-closed for security)
 */
export function runGuardPipeline(payload: DeepLinkPayload): PipelineResult {
  const guards = getGuards();

  for (const { name, guard } of guards) {
    try {
      const result = guard(payload);

      if (result.action !== "ALLOW") {
        return {
          ...result,
          guardName: name,
        };
      }
    } catch (error) {
      // Fail-closed: if a guard throws, block the navigation
      return {
        action: "BLOCK",
        reason: `Guard "${name}" encountered an error`,
        guardName: name,
      };
    }
  }

  // All guards passed
  return { action: "ALLOW" };
}
