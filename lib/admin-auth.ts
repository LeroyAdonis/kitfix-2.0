import { cookies } from "next/headers";

const ADMIN_COOKIE = "kitfix_admin";
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days

export async function checkAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.has(ADMIN_COOKIE);
}

export async function login(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  if (password !== adminPassword) return false;

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
  });
  return true;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}
