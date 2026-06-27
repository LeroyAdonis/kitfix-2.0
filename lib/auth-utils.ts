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
