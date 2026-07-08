import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { user } from "./db/schema";
import { eq } from "drizzle-orm";
import { verifySessionToken } from "./auth-jwt";

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

    const payload = await verifySessionToken(token);
    if (!payload) return null;

    const users = await db
      .select()
      .from(user)
      .where(eq(user.id, payload.userId))
      .limit(1);

    if (users.length === 0) return null;

    return {
      user: users[0],
      session: {
        id: payload.sessionId,
        userId: payload.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        token,
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: null,
        userAgent: null,
        impersonatedBy: null,
      },
    };
  } catch {
    return null;
  }
}

export async function getSessionFromHeaders() {
  const hdrs = await headers();
  const userId = hdrs.get("x-user-id");
  const userName = hdrs.get("x-user-name");
  const userRole = hdrs.get("x-user-role");
  const sessionId = hdrs.get("x-session-id");
  if (!userId) return null;
  return {
    user: { id: userId, name: userName, role: userRole } as any,
    session: { userId, id: sessionId } as any,
  };
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  return session;
}

export async function requireRole(roles: string[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role)) {
    redirect("/");
  }
  return session;
}

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
