import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_PATTERNS = [
  "/dashboard",
  "/repairs/(.*)",
  "/repairs",
  "/payments",
  "/profile",
  "/notifications",
  "/admin",
  "/admin/(.*)",
  "/shop",
  "/shop/(.*)",
  "/checkout",
  "/cart",
  "/orders",
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

const SECRET = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || "kitfix-dev-secret-change-in-production",
);

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
    const { payload } = await jwtVerify(token, SECRET);
    const response = NextResponse.next();
    if (payload.userId) response.headers.set("x-user-id", payload.userId as string);
    if (payload.name) response.headers.set("x-user-name", payload.name as string);
    if (payload.role) response.headers.set("x-user-role", payload.role as string);
    if (payload.sessionId) response.headers.set("x-session-id", payload.sessionId as string);
    return response;
  } catch {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL(`/sign-in?callbackUrl=${callbackUrl}`, request.url)
    );
  }
}

export const config = {
  matcher: [
    "/dashboard",
    "/repairs",
    "/repairs/(.*)",
    "/payments",
    "/profile",
    "/notifications",
    "/admin",
    "/admin/(.*)",
    "/shop",
    "/shop/(.*)",
    "/checkout",
    "/cart",
    "/orders",
  ],
};
