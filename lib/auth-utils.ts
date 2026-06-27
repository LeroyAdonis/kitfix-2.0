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

type AuthSession = NonNullable<Awaited<ReturnType<typeof getSession>>>;

/**
 * Wraps a server action with authentication.
 * The wrapped function receives the session as the first argument.
 * Returns { success: false, error: "You must be signed in." } if no session.
 */
export function authenticatedAction<TArgs extends unknown[], TReturn extends { success: boolean }>(
  fn: (session: AuthSession, ...args: TArgs) => Promise<TReturn>,
) {
  return async (...args: TArgs): Promise<TReturn> => {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "You must be signed in." } as unknown as TReturn;
    }
    return fn(session, ...args);
  };
}

/**
 * Wraps a server action with admin authentication.
 * Returns { success: false, error: "Unauthorized" } if not admin.
 */
export function authenticatedAdminAction<TArgs extends unknown[], TReturn extends { success: boolean }>(
  fn: (session: AuthSession, ...args: TArgs) => Promise<TReturn>,
) {
  return async (...args: TArgs): Promise<TReturn> => {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized" } as unknown as TReturn;
    }
    return fn(session, ...args);
  };
}

/**
 * Wraps a server action with role-based authentication.
 * Returns { success: false, error: "Unauthorized" } if the user's role is not in the allowed list.
 */
export function authenticatedRoleAction<TArgs extends unknown[], TReturn extends { success: boolean }>(
  roles: string[],
  fn: (session: AuthSession, ...args: TArgs) => Promise<TReturn>,
) {
  return async (...args: TArgs): Promise<TReturn> => {
    const session = await getSession();
    if (!session || !roles.includes(session.user.role)) {
      return { success: false, error: "Unauthorized" } as unknown as TReturn;
    }
    return fn(session, ...args);
  };
}
