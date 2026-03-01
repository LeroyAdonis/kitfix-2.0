import { auth } from "./auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Get the current session from Better Auth.
 * Returns null if no valid session exists.
 */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
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
