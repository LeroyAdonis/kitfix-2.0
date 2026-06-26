import { auth } from "./auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { session as sessionTable, user } from "./db/schema";
import { eq, and, gt } from "drizzle-orm";

/**
 * Get the current session by reading the cookie from request headers.
 * Uses direct DB query instead of Better Auth's internal session lookup
 * to work around a serialization issue that returns null for valid sessions.
 */
export async function getSession() {
  try {
    const hdrs = await headers();
    const cookieStr = hdrs.get("cookie") ?? "";
    const cookies = Object.fromEntries(
      cookieStr.split(";").map((c) => {
        const [k, ...v] = c.trim().split("=");
        return [k, v.join("=")];
      }),
    );
    const token = cookies["better-auth.session_token"];
    if (!token) return null;

    const sessions = await db
      .select()
      .from(sessionTable)
      .where(
        and(eq(sessionTable.token, token), gt(sessionTable.expiresAt, new Date())),
      )
      .limit(1);

    if (sessions.length === 0) return null;

    const s = sessions[0];
    const users = await db
      .select()
      .from(user)
      .where(eq(user.id, s.userId))
      .limit(1);

    if (users.length === 0) return null;

    return {
      user: users[0],
      session: s,
    };
  } catch {
    return null;
  }
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
