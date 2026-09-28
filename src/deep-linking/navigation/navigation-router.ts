
import type { DeepLinkPayload, NavigationInstruction } from "../types/deep-link.types";
import { FALLBACK_ROUTE, LOGIN_ROUTE } from "../constants/routes";
import { mapPayloadToNavigation } from "./route-mapper";
import type { Router } from "expo-router";

// ─── Router Reference ──────────────────────────────────────────────────────────


let _router: Router | null = null;

let _pendingQueue: NavigationInstruction[] = [];


export function setRouter(router: Router): void {
  _router = router;

  // Flush any queued navigations
  if (_pendingQueue.length > 0) {
    const queue = [..._pendingQueue];
    _pendingQueue = [];
    for (const instruction of queue) {
      executeNavigation(instruction);
    }
  }
}

export function isRouterReady(): boolean {
  return _router !== null;
}

// ─── Navigation Functions ──────────────────────────────────────────────────────

export function navigateToDeepLink(payload: DeepLinkPayload): void {
  const instruction = mapPayloadToNavigation(payload);
  scheduleOrExecute(instruction);
}

export function navigateToLogin(): void {
  scheduleOrExecute({ pathname: LOGIN_ROUTE, params: {} });
}


export function navigateToFallback(): void {
  scheduleOrExecute({ pathname: FALLBACK_ROUTE, params: {} });
}


export function navigateToRedirect(path: string): void {
  scheduleOrExecute({ pathname: path, params: {} });
}

// ─── Internal ──────────────────────────────────────────────────────────────────


let _lastNavigationKey = "";
let _lastNavigationTime = 0;
const NAVIGATION_DEDUP_WINDOW_MS = 2500;

function scheduleOrExecute(instruction: NavigationInstruction): void {
  if (_router) {
    executeNavigation(instruction);
  } else {
    // Only queue latest pending instruction
    _pendingQueue = [instruction];
  }
}

function executeNavigation(instruction: NavigationInstruction): void {
  if (!_router) return;

  const navKey = `${instruction.pathname}:${JSON.stringify(instruction.params || {})}`;
  const now = Date.now();
  if (navKey === _lastNavigationKey && now - _lastNavigationTime < NAVIGATION_DEDUP_WINDOW_MS) {
    return;
  }
  _lastNavigationKey = navKey;
  _lastNavigationTime = now;

  setTimeout(() => {
    try {
      const hasParams = Object.keys(instruction.params).length > 0;
      if (hasParams) {
        _router!.navigate({
          pathname: instruction.pathname as any,
          params: instruction.params,
        });
      } else {
        _router!.navigate(instruction.pathname as any);
      }
    } catch (error) {
      try {
        const hasParams = Object.keys(instruction.params).length > 0;
        if (hasParams) {
          _router!.push({
            pathname: instruction.pathname as any,
            params: instruction.params,
          });
        } else {
          _router!.push(instruction.pathname as any);
        }
      } catch (e) {
        console.warn("[DeepLink] Navigation error:", e);
      }
    }
  }, 50);
}
