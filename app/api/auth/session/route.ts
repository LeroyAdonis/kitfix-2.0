import { db } from "@/lib/db";
import { user, session as sessionTable } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * Direct session lookup — bypasses Better Auth's internal session cache
 * which returns null for valid sessions due to a serialization issue.
 */
export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    }),
  );

  const token = cookies["better-auth.session_token"];
  if (!token) {
    return NextResponse.json({ session: null, user: null });
  }

  try {
    const sessions = await db
      .select()
      .from(sessionTable)
      .where(
        and(
          eq(sessionTable.token, token),
          gt(sessionTable.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (sessions.length === 0) {
      return NextResponse.json({ session: null, user: null });
    }

    const s = sessions[0];
    const users = await db
      .select()
      .from(user)
      .where(eq(user.id, s.userId))
      .limit(1);

    if (users.length === 0) {
      return NextResponse.json({ session: null, user: null });
    }

    return NextResponse.json({
      session: {
        id: s.id,
        userId: s.userId,
        expiresAt: s.expiresAt,
        token: s.token,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
        impersonatedBy: s.impersonatedBy,
      },
      user: {
        id: users[0].id,
        name: users[0].name,
        email: users[0].email,
        emailVerified: users[0].emailVerified,
        image: users[0].image,
        role: users[0].role,
        createdAt: users[0].createdAt,
        updatedAt: users[0].updatedAt,
      },
    });
  } catch (err) {
    console.error("Direct session lookup failed:", err);
    return NextResponse.json({ session: null, user: null }, { status: 500 });
  }
}
