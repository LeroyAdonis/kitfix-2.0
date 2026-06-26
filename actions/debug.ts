"use server";

import { db } from "@/lib/db";
import { session as sessionTable } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";

/**
 * Direct database session check — bypasses Better Auth's session lookup
 * to debug why /api/auth/get-session returns null for valid sessions.
 */
export async function debugSessionAction(token: string) {
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

    return {
      found: sessions.length > 0,
      session: sessions[0] ?? null,
      tokenPrefix: token.substring(0, 10),
    };
  } catch (err) {
    return { found: false, error: String(err) };
  }
}
