import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "payments not configured" }, { status: 500 });
  }

  const raw = await req.text();

  const expected = crypto
    .createHmac("sha512", secretKey)
    .update(raw, "utf8")
    .digest("hex");
  const sig = req.headers.get("x-paystack-signature");
  if (!sig || sig !== expected) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let event: {
    event?: string;
    data?: {
      reference?: string;
      amount?: unknown;
      currency?: unknown;
      metadata?: { jobId?: string };
    };
  };
  try {
    event = JSON.parse(raw);
  } catch (e) {
    console.error("webhook: invalid json", e);
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  if (event?.event === "charge.success") {
    const ref = event.data?.reference;
    const jobId = event.data?.metadata?.jobId;
    // What Paystack actually charged, in minor units (cents). Filter here so a
    // malformed amount can never overwrite a good record with NaN/garbage.
    const rawAmount = event.data?.amount;
    const amount =
      typeof rawAmount === "number" &&
      Number.isInteger(rawAmount) &&
      rawAmount >= 0
        ? rawAmount
        : undefined;
    const rawCurrency = event.data?.currency;
    const currency =
      typeof rawCurrency === "string" && rawCurrency.trim()
        ? rawCurrency.trim().toUpperCase()
        : undefined;
    if (ref && jobId) {
      try {
        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
        if (convexUrl) {
          const res = await fetch(`${convexUrl}/api/mutation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              path: "jobs:markPaid",
              args: {
                jobId,
                reference: ref,
                ...(amount !== undefined ? { amount } : {}),
                ...(currency !== undefined ? { currency } : {}),
              },
            }),
          });
          if (!res.ok) {
            console.error("webhook: markPaid failed", res.status, await res.text());
          }
        }
      } catch (e) {
        console.error("webhook: markPaid error", e);
      }
    }
  }

  return NextResponse.json({ received: true });
}