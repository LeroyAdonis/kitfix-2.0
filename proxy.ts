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
  process.env.BETTER_AUTH_SECRET || "kitfix-dev-secret-change-in-production",
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
    await jwtVerify(token, SECRET);
    return NextResponse.next();
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
  ],
};
