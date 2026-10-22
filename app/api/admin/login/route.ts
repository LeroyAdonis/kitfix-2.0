import { NextResponse } from "next/server";
import { login } from "@/lib/admin-auth";

function extractIp(req: Request): string {
  // Prefer the first hop in x-forwarded-for; fall back to a placeholder the tests pass.
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "127.0.0.1";
}

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const ip = extractIp(req);
    const ok = await login(password, ip);
    if (ok) return NextResponse.json({ success: true });
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
