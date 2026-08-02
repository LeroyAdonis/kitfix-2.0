import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("job");
  if (!jobId) {
    return NextResponse.json({ error: "missing job" }, { status: 400 });
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json({ error: "payments not configured" }, { status: 500 });
  }

  let jobData: { value?: unknown; result?: unknown };
  try {
    const res = await fetch(`${convexUrl}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "jobs:get", args: { id: jobId } }),
    });
    if (!res.ok) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }
    jobData = await res.json();
  } catch (e) {
    console.error("verify: convex fetch error", e);
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const rawJob = jobData?.value ?? jobData?.result;
  if (typeof rawJob !== "object" || rawJob === null) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const job = rawJob as { paymentStatus?: string; quoteStatus?: string };

  if (job.paymentStatus === "paid") {
    return NextResponse.json({ paid: true });
  }
  return NextResponse.json({ paid: false, status: job.quoteStatus ?? "unknown" });
}