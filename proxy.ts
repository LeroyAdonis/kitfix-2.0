import { type NextRequest, NextResponse } from "next/server";

/**
 * Next.js 16 proxy – lightweight auth gate.
 *
 * Checks for the Better Auth session cookie and redirects:
 *   • Unauthenticated users hitting protected routes → /sign-in
 *   • Authenticated users hitting auth pages → /dashboard
 *
 * Real token verification and role-based checks stay in server-component
 * layouts via requireAuth() / requireRole() (see lib/auth-utils.ts).
 */

const SESSION_COOKIE = "better-auth.session_token";

/** Auth pages that logged-in users should be redirected away from. */
const AUTH_ROUTES = new Set([
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/verify-email",
]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  // ── Unauthenticated user on a protected route → sign-in ────────
  if (!hasSession && !AUTH_ROUTES.has(pathname)) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // ── Authenticated user on an auth page → dashboard ─────────────
  if (hasSession && AUTH_ROUTES.has(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

/**
 * Only invoke the proxy for routes that need auth decisions.
 * Static assets, API routes, and the homepage are excluded.
 */
export const config = {
  matcher: [
    // Protected (customer) routes
    "/dashboard/:path*",
    "/repairs/:path*",
    "/payments/:path*",
    "/profile/:path*",
    "/notifications/:path*",
    // Protected (admin) routes
    "/admin/:path*",
    // Auth pages (for redirect-when-logged-in logic)
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/verify-email",
  ],
};
