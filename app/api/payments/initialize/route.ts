import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let jobId: string;
  try {
    const body = await req.json();
    jobId = typeof body?.jobId === "string" ? body.jobId : "";
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  if (!jobId) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json({ error: "payments not configured" }, { status: 500 });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "payments not configured" }, { status: 500 });
  }

  // Load job
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
    console.error("initialize: convex fetch error", e);
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const rawJob = jobData?.value ?? jobData?.result;
  if (typeof rawJob !== "object" || rawJob === null) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const job = rawJob as {
    _id: string;
    quoteStatus?: string;
    paymentStatus?: string;
    customerEmail?: string;
    quote?: number;
  };

  if (job.quoteStatus !== "confirmed") {
    return NextResponse.json({ error: "quote not confirmed" }, { status: 400 });
  }
  if (job.paymentStatus === "paid") {
    return NextResponse.json({ error: "already paid" }, { status: 400 });
  }
  if (!job.customerEmail) {
    return NextResponse.json({ error: "missing customer email" }, { status: 400 });
  }
  if (typeof job.quote !== "number") {
    return NextResponse.json({ error: "invalid quote" }, { status: 400 });
  }

  const reference = `KF-${job._id.slice(0, 8).toUpperCase()}-${Date.now().toString(36)}`;
  const callbackUrl = `${process.env.SITE_URL ?? "http://localhost:3000"}/pay/complete?job=${job._id}`;

  let paystackRes: Response;
  let data: any;
  try {
    paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: job.customerEmail,
        amount: job.quote,
        currency: "ZAR",
        reference,
        callback_url: callbackUrl,
        metadata: { jobId: job._id },
      }),
    });
    data = await paystackRes.json();
  } catch (e) {
    console.error("initialize: paystack error", e);
    return NextResponse.json({ error: "paystack_error" }, { status: 502 });
  }

  if (!paystackRes.ok) {
    return NextResponse.json({ error: "paystack_error" }, { status: 502 });
  }

  try {
    await fetch(`${convexUrl}/api/mutation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "jobs:setPaymentReference",
        args: { id: job._id, reference },
      }),
    });
  } catch (e) {
    console.error("initialize: store reference error", e);
  }

  const authorizationUrl = data?.data?.authorization_url;
  if (typeof authorizationUrl !== "string") {
    return NextResponse.json({ error: "paystack_error" }, { status: 502 });
  }

  return NextResponse.json({ authorization_url: authorizationUrl, reference });
}