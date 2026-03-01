// TODO: Implement — Polar.sh webhook handler
// Verify webhook signature, process payment events
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: "Polar webhook handler — TODO" });
}
