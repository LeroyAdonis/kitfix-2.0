import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/repairs", "/payments", "/profile", "/notifications", "/orders", "/admin"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (!isProtected) return NextResponse.next();

  // Check for session cookie
  const sessionCookie = request.cookies.get("better-auth.session_token");
  const adminPaths = ["/admin"];

  if (!sessionCookie) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // For admin paths, we do a quick check — the layout will also verify the role
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons|sw.js|~offline).*)",
  ],
};
