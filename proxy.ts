import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { session as sessionTable } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";

const PROTECTED_PATTERNS = [
  "/dashboard",
  "/repairs/(.*)",
  "/repairs",
  "/payments",
  "/profile",
  "/notifications",
  "/admin",
  "/admin/(.*)",
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PATTERNS.some((pattern) => {
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname);
  });
}

function getSessionToken(request: NextRequest): string | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    })
  );
  return cookies["better-auth.session_token"] ?? null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  const token = getSessionToken(request);
  if (!token) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL(`/sign-in?callbackUrl=${callbackUrl}`, request.url)
    );
  }

  try {
    const sessions = await db
      .select()
      .from(sessionTable)
      .where(
        and(
          eq(sessionTable.token, token),
          gt(sessionTable.expiresAt, new Date())
        )
      )
      .limit(1);

    if (sessions.length === 0) {
      const callbackUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(
        new URL(`/sign-in?callbackUrl=${callbackUrl}`, request.url)
      );
    }

    return NextResponse.next();
  } catch {
    // DB error — let request through to the page (page-level auth will handle)
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/dashboard",
    "/repairs/(.*)",
    "/payments",
    "/profile",
    "/notifications",
    "/admin/(.*)",
  ],
};
