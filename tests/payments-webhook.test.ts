import crypto from "node:crypto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST as webhook } from "@/app/api/payments/webhook/route";

/**
 * The Paystack webhook is the only thing that can mark a job paid, so its signature
 * check is a money path: if it can be bypassed, anyone can POST "charge.success" and
 * get a job marked paid without paying.
 *
 * Everything here is offline. Convex is represented by the stubbed global `fetch`,
 * which is exactly the surface the route uses to run the `jobs:markPaid` mutation.
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
