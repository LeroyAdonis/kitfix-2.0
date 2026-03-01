// TODO: Implement — Route protection middleware
// Protect customer and admin routes, redirect unauthenticated users
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // TODO: Validate session via Better Auth
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/repairs/:path*", "/admin/:path*", "/profile/:path*"],
};
