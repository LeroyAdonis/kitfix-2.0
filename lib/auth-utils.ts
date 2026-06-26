import { auth } from "./auth";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Get the current session from Better Auth.
 * Returns null if no valid session exists.
 *
 * Uses the `cookies()` API to read session cookies for reliable
 * RSC access (avoids `__Secure-` cookie prefix issues on Vercel edge).
 */
export async function getSession() {
  const hdrs = await headers();
  const jar = await cookies();

  // If headers already have the cookie, use them directly
  const cookieHeader = hdrs.get("cookie");
  if (cookieHeader?.includes("better-auth.session_token")) {
    return auth.api.getSession({ headers: hdrs });
  }

  // Otherwise, reconstruct headers with all cookies from the cookie jar
  // This ensures `__Secure-` prefixed cookies are properly forwarded
  // in RSC context on Vercel deployments.
  const allCookies = jar.getAll();
  if (allCookies.length > 0) {
    const cookieStr = allCookies
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");
    const enrichedHeaders = new Headers(hdrs);
    enrichedHeaders.set("cookie", cookieStr);
    return auth.api.getSession({ headers: enrichedHeaders });
  }

  return auth.api.getSession({ headers: hdrs });
}

/**
 * Require an authenticated session. Redirects to sign-in if none.
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  return session;
}

/**
 * Require the authenticated user to have one of the specified roles.
 * Redirects to home if the user's role is not in the allowed list.
 */
export async function requireRole(roles: string[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role)) {
    redirect("/");
  }
  return session;
}

/**
 * Require the authenticated user to own the resource, or be an admin.
 * Redirects to home if ownership check fails.
 */
export async function requireOwnership(resourceOwnerId: string) {
  const session = await requireAuth();
  if (session.user.role !== "admin" && session.user.id !== resourceOwnerId) {
    redirect("/");
  }
  return session;
}
