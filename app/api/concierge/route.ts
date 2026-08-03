import { NextResponse } from "next/server";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

async function convexQuery(fn: string, args: Record<string, unknown> = {}) {
  const res = await fetch(`${CONVEX_URL}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: fn, args }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Convex query error: ${err}`);
  }
  return res.json();
}

async function convexMutation(fn: string, args: Record<string, unknown> = {}) {
  const res = await fetch(`${CONVEX_URL}/api/mutation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: fn, args }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Convex mutation error: ${err}`);
  }
  return res.json();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, ...data } = body;

    if (!CONVEX_URL) {
      return NextResponse.json(
        { error: "Convex not configured. Run `npx convex dev` first." },
        { status: 503 },
      );
    }

    switch (action) {
      case "create-job": {
        const jobId = await convexMutation("jobs:create", {
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          description: data.description,
          photoUrls: data.photoUrls || [],
        });
        return NextResponse.json({ success: true, jobId });
      }

      case "get-jobs": {
        const jobs = await convexQuery("jobs:list");
        return NextResponse.json({ success: true, jobs });
      }

      case "get-job": {
        const job = await convexQuery("jobs:get", { id: data.jobId });
        return NextResponse.json({ success: true, job });
      }

      case "update-status": {
        await convexMutation("jobs:updateStatus", {
          id: data.jobId,
          status: data.status,
        });
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
