import { cookies } from "next/headers";
import { logger } from "./logger";

const ADMIN_COOKIE = "kitfix_admin";
const SESSION_DURATION = 60 * 60 * 24 * 7;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

const attempts = new Map<string, { count: number; firstAt: number }>();
let globalFailed = 0;
let globalFirstAt = 0;

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (rec && now - rec.firstAt < LOCKOUT_MS && rec.count >= MAX_ATTEMPTS) return true;
  if (globalFailed >= MAX_ATTEMPTS && now - globalFirstAt < LOCKOUT_MS) return true;
  return false;
}

function recordFailed(ip: string) {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (rec && now - rec.firstAt >= LOCKOUT_MS) {
    attempts.set(ip, { count: 0, firstAt: now });
  }
  const r = attempts.get(ip) ?? { count: 0, firstAt: now };
  r.count += 1;
  attempts.set(ip, r);
  globalFailed += 1;
  if (globalFirstAt === 0) globalFirstAt = now;
  else if (now - globalFirstAt >= LOCKOUT_MS) globalFirstAt = now;
  logger.warn("Admin login failed from IP=" + ip + " at=" + new Date(now).toISOString() + ": no password logged");
}

function clearFailed(ip: string) {
  attempts.delete(ip);
}

export async function checkAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.has(ADMIN_COOKIE);
}

export async function login(password: string, ip?: string): Promise<boolean> {
  // Check rate limit first
  if (ip && isRateLimited(ip)) {
    logger.warn("Admin login rate-limited from IP=" + ip);
    return false;
  }
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  // Constant-time comparison — a wrong password cannot be timed
  if (!constantTimeCompare(password, adminPassword)) {
    recordFailed(ip ?? "unknown");
    return false;
  }
  // On success, clear any prior rate-limit state for this IP
  if (ip) clearFailed(ip);
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
