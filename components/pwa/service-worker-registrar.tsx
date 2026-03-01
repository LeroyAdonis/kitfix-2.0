"use client";

import { useEffect } from "react";

/**
 * Registers the service worker in production environments.
 * Renders nothing — purely a side-effect component.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Service worker registration failed — non-critical, app works without it
      });
    }
  }, []);

  return null;
}
