import { NextResponse } from "next/server";
import { login } from "@/lib/admin-auth";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const ok = await login(password);
    if (ok) return NextResponse.json({ success: true });
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
