"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/**
 * Global navigation progress bar for Next.js App Router.
 *
 * Shows a thin animated bar at the top of the viewport during client-side
 * route transitions. Intercepts internal link clicks and browser back/forward
 * navigation, then clears once `usePathname()` reflects the new route.
 *
 * Place once in the root layout (inside `<body>`).
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Navigation complete ──────────────────────────────────────────────
  // Whenever the pathname changes, the new page has mounted.
  useEffect(() => {
    setIsNavigating(false);
    setProgress(0);
  }, [pathname]);

  // ── Cleanup interval on unmount or when navigation ends ──────────────
  useEffect(() => {
    if (!isNavigating && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [isNavigating]);

  // ── Start navigation ────────────────────────────────────────────────
  const startNavigation = useCallback(() => {
    setIsNavigating(true);
    setProgress(13);
  }, []);

  // ── Intercept internal link clicks ───────────────────────────────────
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      // Ignore non-primary clicks and modifier-key combos (open-in-new-tab)
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;

      const anchor = (event.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (anchor.target === "_blank") return;
      if (anchor.hasAttribute("download")) return;

      // Resolve against current origin
      let url: URL;
      try {
        url = new URL(href, window.location.origin);
      } catch {
        return; // malformed URL — ignore
      }

      // Only intercept same-origin navigation to a different path
      if (url.origin !== window.location.origin) return;
      if (url.pathname === pathname) return;

      startNavigation();
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () =>
      document.removeEventListener("click", handleClick, { capture: true });
  }, [pathname, startNavigation]);

  // ── Intercept browser back/forward ───────────────────────────────────
  useEffect(() => {
    function handlePopState() {
      if (window.location.pathname !== pathname) {
        startNavigation();
      }
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [pathname, startNavigation]);

  // ── Simulate trickle progress ────────────────────────────────────────
  useEffect(() => {
    if (!isNavigating) return;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        // Slow down as we approach 90 %
        return prev + (90 - prev) * 0.1;
      });
    }, 200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isNavigating]);

  // ── Reduced-motion: static bar, no animation ────────────────────────
  if (shouldReduceMotion) {
    if (!isNavigating) return null;

    return (
      <div
        className="fixed inset-x-0 top-0 z-[9999] h-0.5 bg-primary"
        role="progressbar"
        aria-label="Loading page"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        data-slot="navigation-progress"
      />
    );
  }

  // ── Animated bar ─────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          className="fixed inset-x-0 top-0 z-[9999] h-0.5 origin-left"
          style={{ background: "var(--gradient-primary)" }}
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: progress / 100, opacity: 1 }}
          exit={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          role="progressbar"
          aria-label="Loading page"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          data-slot="navigation-progress"
        />
      )}
    </AnimatePresence>
  );
}
