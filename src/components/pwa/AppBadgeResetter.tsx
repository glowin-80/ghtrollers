// src/components/pwa/AppBadgeResetter.tsx
"use client";

import { useEffect, useRef } from "react";
import { clearNotificationAppBadge } from "@/lib/app-badge";

type IdleCallbackHandle = number;

type WindowWithIdleCallback = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => IdleCallbackHandle;
  cancelIdleCallback?: (handle: IdleCallbackHandle) => void;
};

export default function AppBadgeResetter() {
  const pendingClearRef = useRef<IdleCallbackHandle | null>(null);
  const lastClearStartedAtRef = useRef(0);

  useEffect(() => {
    const clearThrottleMs = 1500;

    function cancelScheduledClear() {
      if (pendingClearRef.current === null) return;

      const win = window as WindowWithIdleCallback;

      if (typeof win.cancelIdleCallback === "function") {
        win.cancelIdleCallback(pendingClearRef.current);
      } else {
        window.clearTimeout(pendingClearRef.current);
      }

      pendingClearRef.current = null;
    }

    function scheduleClear() {
      if (pendingClearRef.current !== null) return;

      const now = Date.now();
      if (now - lastClearStartedAtRef.current < clearThrottleMs) return;

      const runClear = () => {
        pendingClearRef.current = null;
        lastClearStartedAtRef.current = Date.now();
        void clearNotificationAppBadge();
      };

      const win = window as WindowWithIdleCallback;

      if (typeof win.requestIdleCallback === "function") {
        pendingClearRef.current = win.requestIdleCallback(runClear, { timeout: 1000 });
        return;
      }

      pendingClearRef.current = window.setTimeout(runClear, 0);
    }

    function clearWhenVisible() {
      if (document.visibilityState === "visible") {
        scheduleClear();
      }
    }

    scheduleClear();

    document.addEventListener("visibilitychange", clearWhenVisible);
    window.addEventListener("focus", scheduleClear);

    return () => {
      cancelScheduledClear();
      document.removeEventListener("visibilitychange", clearWhenVisible);
      window.removeEventListener("focus", scheduleClear);
    };
  }, []);

  return null;
}