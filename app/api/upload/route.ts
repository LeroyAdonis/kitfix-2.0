// TODO: Implement — Photo upload endpoint
// Validate file type/size, upload to Vercel Blob
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: "Upload handler — TODO" });
}
