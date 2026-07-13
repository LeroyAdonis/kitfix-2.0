import { NextResponse } from "next/server";

/**
 * GET /api/auth/sign-out
 *
 * Clears the session cookie server-side and redirects to /sign-in.
 * This is more reliable than client-side cookie clearing because
 * the httpOnly cookie can only be set/cleared via a server response.
 */
export async function GET() {
  const response = NextResponse.redirect(
    new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  );

  response.cookies.set("better-auth.session_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
