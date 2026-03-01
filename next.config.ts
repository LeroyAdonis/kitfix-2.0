import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PWA is configured via a manual service worker (public/sw.js) and
  // manifest.json rather than next-pwa, which is incompatible with
  // Next.js 16 / Turbopack. The ServiceWorkerRegistrar client component
  // handles registration in production.
};

export default nextConfig;
