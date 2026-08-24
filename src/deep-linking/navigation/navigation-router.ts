
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
    console.log(`[NavigationRouter] Flushing ${_pendingQueue.length} queued navigation(s)`);
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


function scheduleOrExecute(instruction: NavigationInstruction): void {
  if (_router) {
    executeNavigation(instruction);
  } else {
    console.log("[NavigationRouter] Router not ready. Queueing navigation:", instruction.pathname);
    _pendingQueue.push(instruction);
  }
}


function executeNavigation(instruction: NavigationInstruction): void {
  if (!_router) return;

  setTimeout(() => {
    try {
      console.log(
        "[NavigationRouter] Navigating to:",
        instruction.pathname,
        instruction.params,
      );

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
      console.error("[NavigationRouter] Navigation failed:", error);
      // Don't crash the app — just log the error
    }
  }, 50);
}
