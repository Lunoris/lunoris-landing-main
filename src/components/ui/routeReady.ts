"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const ROUTE_READY_EVENT = "lunoris:route-ready";

interface RouteReadyDetail {
  pathname: string;
}

function normalizePath(path: string): string {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

/**
 * Mounted once in the root layout. Every route in this app is dynamic (the
 * layout reads `cookies()`), so `router.push` waits on a server round trip of
 * unknown length. After the new page commits, this waits two animation frames
 * (so the page has actually painted) and announces it.
 */
export function RouteReadySignal(): null {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    let raf2 = 0;
    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        window.dispatchEvent(
          new CustomEvent<RouteReadyDetail>(ROUTE_READY_EVENT, {
            detail: { pathname: normalizePath(pathname) },
          })
        );
      });
    });
    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
    };
  }, [pathname]);

  return null;
}

/**
 * Resolves once `path` has rendered, or after `timeoutMs` so a slow or failed
 * navigation never leaves a transition overlay stuck over the screen.
 */
export function waitForRoute(path: string, timeoutMs = 8000): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const target = normalizePath(path);

  return new Promise<void>((resolve) => {
    let timer = 0;
    const finish = () => {
      window.clearTimeout(timer);
      window.removeEventListener(ROUTE_READY_EVENT, onReady);
      resolve();
    };
    const onReady = (evt: Event) => {
      const detail = (evt as CustomEvent<RouteReadyDetail>).detail;
      if (detail?.pathname === target) finish();
    };
    window.addEventListener(ROUTE_READY_EVENT, onReady);
    timer = window.setTimeout(finish, timeoutMs);
  });
}
