import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/verify-email",
];

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("better-auth.session_token");
  const { pathname } = request.nextUrl;

  const isPublicRoute =
    PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/api/auth");

  if (!sessionCookie && !isPublicRoute) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/repairs/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/notifications/:path*",
    "/payments/:path*",
  ],
};
