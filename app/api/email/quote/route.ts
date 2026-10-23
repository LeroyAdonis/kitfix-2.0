/**
 * Send the customer their confirmed quote.
 *
 * Called by the admin job screen immediately after the Convex `confirmQuote` mutation succeeds —
 * Convex mutations cannot send SMTP, so the mail is dispatched from a Next.js route instead.
 *
 * Admin-cookie protected: the quote amount and recipient must never be settable by the public web.
 * The values are re-checked against nothing else on purpose (there is no server-side Convex client in
 * this app today); the trust boundary is the admin session, and a wrong amount can only come from an
 * admin who just typed it.
 */
import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin-auth";
import { sendMail, mailConfigured, quoteConfirmed } from "@/lib/email";

export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!mailConfigured()) {
    return NextResponse.json({ sent: false, reason: "SMTP not configured" }, { status: 503 });
  }

  let body: { to?: string; name?: string; reference?: string; amountRands?: number; payUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const to = (body.to || "").trim();
  const amount = Number(body.amountRands);
  if (!to.includes("@")) {
    return NextResponse.json({ sent: false, reason: "customer has no email on file" }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ sent: false, reason: "invalid quote amount" }, { status: 400 });
  }

  const { subject, text } = quoteConfirmed({
    name: body.name || "there",
    reference: body.reference || "your repair",
    amountRands: amount,
    payUrl: body.payUrl,
  });

  const result = await sendMail({ to, subject, text });
  return NextResponse.json(result, { status: result.sent ? 200 : 502 });
}
