import crypto from "node:crypto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST as webhook } from "@/app/api/payments/webhook/route";
import { markPaid } from "@/convex/jobs";

/**
 * The Paystack webhook is the only thing that can mark a job paid, so its signature
 * check is a money path: if it can be bypassed, anyone can POST "charge.success" and
 * get a job marked paid without paying.
 *
 * Everything here is offline. Convex is represented by the stubbed global `fetch`,
 * which is exactly the surface the route uses to run the `jobs:markPaid` mutation.
 * Money-path tests also drive the real `markPaid` handler against an in-memory job
 * row, so "what got persisted" is asserted rather than inferred.
 */

const SECRET = "sk_test_kitfix_unit_test_secret";
const WRONG_SECRET = "sk_test_the_wrong_secret";
const CONVEX_URL = "https://convex.unit-test.invalid";

const sign = (body: string, secret: string = SECRET): string =>
  crypto.createHmac("sha512", secret).update(body, "utf8").digest("hex");

const chargeSuccess = (
  jobId = "job_123",
  reference = "KF-JOB1234-abc",
): string =>
  JSON.stringify({
    event: "charge.success",
    data: { reference, metadata: { jobId } },
  });

/** A signed charge.success that carries what Paystack actually charged. */
const chargeSuccessWithAmount = (opts: {
  jobId?: string;
  reference?: string;
  amount?: unknown;
  currency?: unknown;
} = {}): string =>
  JSON.stringify({
    event: "charge.success",
    data: {
      reference: opts.reference ?? "KF-JOB1234-abc",
      metadata: { jobId: opts.jobId ?? "job_123" },
      amount: opts.amount ?? 25000,
      currency: opts.currency ?? "ZAR",
    },
  });

/**
 * `signature: undefined` → sign the body correctly.
 * `signature: null`      → omit the header entirely.
 * `signature: "..."`     → send that exact header value.
 */
function webhookRequest(
  body: string,
  signature?: string | null,
): Request {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (signature !== null) {
    headers["x-paystack-signature"] = signature ?? sign(body);
  }
  return new Request("https://kitfix.test/api/payments/webhook", {
    method: "POST",
    headers,
    body,
  });
}

type FetchMock = ReturnType<typeof vi.fn<typeof stubFetch>>;

function stubFetch(
  _input: RequestInfo | URL,
  _init?: RequestInit,
): Promise<Response> {
  return Promise.resolve(
    new Response(JSON.stringify({ status: "success" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  );
}

let fetchMock: FetchMock;

/** The Convex mutation call, if the route made one. */
const convexMutationCalls = () =>
  fetchMock.mock.calls.filter(([input]) =>
    String(input).includes("/api/mutation"),
  );

const markPaidCalls = () =>
  convexMutationCalls().filter(([, init]) =>
    String(init?.body ?? "").includes("jobs:markPaid"),
  );

/** The args of each `jobs:markPaid` call the route made, in order. */
const markPaidArgs = () =>
  markPaidCalls().map(
    ([, init]) =>
      JSON.parse(String(init?.body)).args as {
        jobId: string;
        reference: string;
        amount?: number;
        currency?: string;
      },
  );

type MarkPaidResult = { ok: boolean; alreadyPaid: boolean };

type JobRow = {
  _id: string;
  paymentStatus?: "unpaid" | "paid";
  paymentReference?: string;
  paymentAmount?: number;
  paymentCurrency?: string;
  paidAt?: number;
};

/**
 * `markPaid` is a Convex mutation; its handler is the plain async function below the
 * validator wrapper. Driving it directly is how we assert what actually lands on the
 * row (one write, exact amount) instead of trusting the HTTP shape.
 */
const markPaidHandler = (
  markPaid as unknown as {
    _handler: (
      ctx: unknown,
      args: {
        jobId: string;
        reference: string;
        amount?: number;
        currency?: string;
      },
    ) => Promise<MarkPaidResult>;
  }
)._handler;

/** Minimal in-memory Convex ctx: one row, patch logged so double-writes are visible. */
function fakeCtx(row: JobRow) {
  const patches: Partial<JobRow>[] = [];
  return {
    patches,
    row,
    ctx: {
      db: {
        get: async (id: string) => (row._id === id ? { ...row } : null),
        patch: async (id: string, patch: Partial<JobRow>) => {
          if (id !== row._id) throw new Error("patch on unknown row");
          patches.push(patch);
          Object.assign(row, patch);
        },
      },
    },
  };
}

beforeEach(() => {
  vi.stubEnv("PAYSTACK_SECRET_KEY", SECRET);
  vi.stubEnv("NEXT_PUBLIC_CONVEX_URL", CONVEX_URL);
  fetchMock = vi.fn(stubFetch);
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("POST /api/payments/webhook — signature enforcement", () => {
  it("accepts a correctly signed charge.success and runs jobs:markPaid", async () => {
    const body = chargeSuccess("job_123", "KF-JOB1234-abc");

    const res = await webhook(webhookRequest(body));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ received: true });

    // The mutation is the only side effect that matters: it must have fired once,
    // with the job id and reference from the signed payload.
    const calls = markPaidCalls();
    expect(calls).toHaveLength(1);

    const [url, init] = calls[0];
    expect(String(url)).toBe(`${CONVEX_URL}/api/mutation`);
    expect(JSON.parse(String(init?.body))).toEqual({
      path: "jobs:markPaid",
      args: { jobId: "job_123", reference: "KF-JOB1234-abc" },
    });
  });

  it("rejects a tampered body and never marks the job paid", async () => {
    const original = chargeSuccess("job_123");
    // Signature issued for the honest payload...
    const signature = sign(original);
    // ...but the attacker swaps in a different payload (bigger reference/amount).
    const tampered = JSON.stringify({
      event: "charge.success",
      data: {
        reference: "KF-ATTACKER-999",
        metadata: { jobId: "job_999" },
        amount: 999999,
      },
    });

    const res = await webhook(webhookRequest(tampered, signature));

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "invalid signature" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(markPaidCalls()).toHaveLength(0);
  });

  it("rejects a body signed with the wrong secret", async () => {
    const body = chargeSuccess();
    const forgedSignature = sign(body, WRONG_SECRET);

    const res = await webhook(webhookRequest(body, forgedSignature));

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "invalid signature" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(markPaidCalls()).toHaveLength(0);
  });

  it("rejects a request with no signature header", async () => {
    const res = await webhook(webhookRequest(chargeSuccess(), null));

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "invalid signature" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(markPaidCalls()).toHaveLength(0);
  });

  it("does not mark a job paid for a correctly signed non-charge event", async () => {
    const body = JSON.stringify({
      event: "charge.failed",
      data: { reference: "KF-FAIL", metadata: { jobId: "job_123" } },
    });

    const res = await webhook(webhookRequest(body));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ received: true });
    expect(markPaidCalls()).toHaveLength(0);
  });

  it("refuses everything when PAYSTACK_SECRET_KEY is unset", async () => {
    vi.stubEnv("PAYSTACK_SECRET_KEY", "");
    const body = chargeSuccess();

    const res = await webhook(webhookRequest(body));

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({
      error: "payments not configured",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a correctly signed body that is not valid JSON", async () => {
    const body = "not-json";

    const res = await webhook(webhookRequest(body));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "invalid payload" });
    expect(markPaidCalls()).toHaveLength(0);
  });
});

describe("POST /api/payments/webhook — records the amount actually charged", () => {
  it("forwards the charged amount (minor units) and currency from a signed charge.success", async () => {
    const body = chargeSuccessWithAmount({
      jobId: "job_123",
      reference: "KF-JOB1234-abc",
      amount: 25000,
      currency: "ZAR",
    });

    const res = await webhook(webhookRequest(body));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ received: true });

    expect(markPaidArgs()).toEqual([
      {
        jobId: "job_123",
        reference: "KF-JOB1234-abc",
        amount: 25000,
        currency: "ZAR",
      },
    ]);
  });

  it("persists the charged amount on the job row via jobs:markPaid", async () => {
    const body = chargeSuccessWithAmount({ amount: 25000, currency: "ZAR" });
    await webhook(webhookRequest(body));

    const [args] = markPaidArgs();
    const { ctx, row, patches } = fakeCtx({ _id: args.jobId });

    const result = await markPaidHandler(ctx, args);

    expect(result).toEqual({ ok: true, alreadyPaid: false });
    expect(patches).toHaveLength(1);
    // Read back: the row now holds what Paystack charged, not the quote.
    expect(row.paymentStatus).toBe("paid");
    expect(row.paymentReference).toBe("KF-JOB1234-abc");
    expect(row.paymentAmount).toBe(25000);
    expect(row.paymentCurrency).toBe("ZAR");
    expect(typeof row.paidAt).toBe("number");
  });

  it("a retried duplicate charge.success leaves a single consistent record", async () => {
    // Paystack retries the exact same signed payload when our 200 is slow/lost.
    const body = chargeSuccessWithAmount({ amount: 25000, currency: "ZAR" });

    const first = await webhook(webhookRequest(body));
    const second = await webhook(webhookRequest(body));

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    // Two deliveries, byte-identical mutation args — nothing drifts on retry.
    const args = markPaidArgs();
    expect(args).toHaveLength(2);
    expect(args[0]).toEqual(args[1]);

    const { ctx, row, patches } = fakeCtx({ _id: args[0].jobId });
    const firstRun = await markPaidHandler(ctx, args[0]);
    const paidAt = row.paidAt;
    const secondRun = await markPaidHandler(ctx, args[1]);

    expect(firstRun).toEqual({ ok: true, alreadyPaid: false });
    expect(secondRun).toEqual({ ok: true, alreadyPaid: true });
    // One write only: the retry must not double-write or move paidAt.
    expect(patches).toHaveLength(1);
    expect(row.paidAt).toBe(paidAt);
    expect(row.paymentAmount).toBe(25000);
    expect(row.paymentCurrency).toBe("ZAR");
  });

  it("a duplicate carrying a different amount never rewrites the recorded charge", async () => {
    const { ctx, row, patches } = fakeCtx({ _id: "job_123" });

    await markPaidHandler(ctx, {
      jobId: "job_123",
      reference: "KF-JOB1234-abc",
      amount: 25000,
      currency: "ZAR",
    });
    await markPaidHandler(ctx, {
      jobId: "job_123",
      reference: "KF-JOB1234-abc",
      amount: 1,
      currency: "USD",
    });

    expect(patches).toHaveLength(1);
    expect(row.paymentAmount).toBe(25000);
    expect(row.paymentCurrency).toBe("ZAR");
  });

  it("omits amount/currency when the payload does not carry them (older/verify path)", async () => {
    const signedWithoutAmount = await webhook(webhookRequest(chargeSuccess()));
    expect(signedWithoutAmount.status).toBe(200);

    const [args] = markPaidArgs();
    expect(args).toEqual({ jobId: "job_123", reference: "KF-JOB1234-abc" });

    const { ctx, row, patches } = fakeCtx({ _id: args.jobId });
    const result = await markPaidHandler(ctx, args);

    expect(result).toEqual({ ok: true, alreadyPaid: false });
    expect(patches).toHaveLength(1);
    expect(row.paymentStatus).toBe("paid");
    // Nothing invented: no amount was provided, so none is recorded.
    expect(row.paymentAmount).toBeUndefined();
    expect(row.paymentCurrency).toBeUndefined();
  });

  it("ignores a malformed amount instead of persisting garbage", async () => {
    const body = chargeSuccessWithAmount({
      amount: "R250.00",
      currency: "zar",
    });

    const res = await webhook(webhookRequest(body));
    expect(res.status).toBe(200);

    const [args] = markPaidArgs();
    // A non-integer amount is dropped; currency is still normalised.
    expect(args).toEqual({
      jobId: "job_123",
      reference: "KF-JOB1234-abc",
      currency: "ZAR",
    });

    const { ctx, row } = fakeCtx({ _id: args.jobId });
    await markPaidHandler(ctx, args);
    expect(row.paymentStatus).toBe("paid");
    expect(row.paymentAmount).toBeUndefined();
  });

  it("rejects a negative or fractional amount at the mutation boundary", async () => {
    const { ctx, patches } = fakeCtx({ _id: "job_123" });

    await expect(
      markPaidHandler(ctx, { jobId: "job_123", reference: "KF-X", amount: -1 }),
    ).rejects.toThrow(/minor units/);
    await expect(
      markPaidHandler(ctx, { jobId: "job_123", reference: "KF-X", amount: 250.5 }),
    ).rejects.toThrow(/minor units/);

    expect(patches).toHaveLength(0);
  });

  it("rejection paths still never mark a job paid, amount present or not", async () => {
    const body = chargeSuccessWithAmount({ amount: 25000 });
    const forged = await webhook(webhookRequest(body, sign(body, WRONG_SECRET)));
    const unsigned = await webhook(webhookRequest(body, null));
    const tamperedBody = chargeSuccessWithAmount({ amount: 1 });
    const tampered = await webhook(
      webhookRequest(tamperedBody, sign(body)),
    );

    expect(forged.status).toBe(401);
    expect(unsigned.status).toBe(401);
    expect(tampered.status).toBe(401);
    expect(markPaidCalls()).toHaveLength(0);
  });
});
