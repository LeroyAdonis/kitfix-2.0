/**
 * Admin-only email smoke test.
 *
 * Purpose: prove transactional mail works **in the deployed environment**, because "nodemailer is
 * installed" is not evidence that Zoho accepts our credentials from Vercel's IP ranges. It sends one
 * real message to an address the admin supplies and reports the provider's message id.
 *
 * Protected by the same cookie auth as the rest of /admin — an unauthenticated visitor must never be
 * able to make this server send mail (that would be an open relay for spam).
 */
import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin-auth";
import { sendMail, mailConfigured } from "@/lib/email";
import { BUSINESS } from "@/lib/business";

export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!mailConfigured()) {
    return NextResponse.json(
      { error: "SMTP not configured", hint: "SMTP_USER and SMTP_PASS must be set in the environment" },
      { status: 503 },
    );
  }

  let to = "";
  try {
    const body = (await req.json()) as { to?: string };
    to = (body.to || "").trim();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  if (!to.includes("@")) {
    return NextResponse.json({ error: "a valid 'to' address is required" }, { status: 400 });
  }

  const result = await sendMail({
    to,
    subject: `KitFix mail test — ${new Date().toISOString()}`,
    text: [
      "This is a transactional mail test from the KitFix site.",
      "",
      `Sent from: ${process.env.SMTP_HOST || "smtp.zoho.com"}`,
      `Business phone on file: ${BUSINESS.phone}`,
      "",
      "If you are reading this, quote and booking emails will reach customers.",
    ].join("\n"),
  });

  return NextResponse.json(result, { status: result.sent ? 200 : 502 });
}
