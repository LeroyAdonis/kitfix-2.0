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
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const rawJob = jobData?.value ?? jobData?.result;
  if (typeof rawJob !== "object" || rawJob === null) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const job = rawJob as {
    paymentStatus?: string;
    quoteStatus?: string;
    paymentReference?: string;
  };

  if (job.paymentStatus === "paid") {
    return NextResponse.json({ paid: true });
  }

  if (job.paymentReference && job.quoteStatus === "confirmed") {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (secretKey) {
      try {
        const res = await fetch(
          `https://api.paystack.co/transaction/verify/${job.paymentReference}`,
          { headers: { Authorization: `Bearer ${secretKey}` } },
        );
        const data = await res.json();
        if (data?.data?.status === "success") {
          await fetch(`${convexUrl}/api/mutation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              path: "jobs:markPaid",
              args: { jobId, reference: job.paymentReference },
            }),
          });
          return NextResponse.json({ paid: true, via: "paystack_verify" });
        }
        if (data?.data?.status) {
          return NextResponse.json({ paid: false, status: job.quoteStatus ?? "unknown" });
        }
      } catch {
        return NextResponse.json({ paid: false, status: "unknown" });
      }
    }
  }

  return NextResponse.json({ paid: false, status: job.quoteStatus ?? "unknown" });
}