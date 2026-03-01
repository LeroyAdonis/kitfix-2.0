// TODO: Implement — Better Auth catch-all handler
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "Auth handler — TODO" });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: "Auth handler — TODO" });
}
