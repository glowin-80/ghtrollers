"use client";

import { useEffect } from "react";
import { clearNotificationAppBadge } from "@/lib/app-badge";

export default function AppBadgeResetter() {
  useEffect(() => {
    void clearNotificationAppBadge();

    function clearWhenVisible() {
      if (document.visibilityState === "visible") {
        void clearNotificationAppBadge();
      }
    }

    function clearWhenFocused() {
      void clearNotificationAppBadge();
    }

    document.addEventListener("visibilitychange", clearWhenVisible);
    window.addEventListener("focus", clearWhenFocused);

    return () => {
      document.removeEventListener("visibilitychange", clearWhenVisible);
      window.removeEventListener("focus", clearWhenFocused);
    };
  }, []);

  return null;
}
