import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST as initializePayment } from "@/app/api/payments/initialize/route";

/**
 * /api/payments/initialize creates a real Paystack checkout. The guard under test is
 * `quoteStatus === "confirmed"`: an unpaid *estimate* must never become a chargeable
 * checkout link, because the customer has not agreed to that price yet.
 *
 * Offline: Convex and Paystack are both reached through global `fetch`, so the stub
 * below answers by URL and records every call.
 */

const CONVEX_URL = "https://convex.unit-test.invalid";
const SECRET = "sk_test_kitfix_unit_test_secret";
const PAYSTACK_INIT = "https://api.paystack.co/transaction/initialize";
const CHECKOUT_URL = "https://checkout.paystack.com/unit-test";

type JobOverrides = {
  quoteStatus?: string;
  paymentStatus?: string;
  customerEmail?: string;
  quote?: number | null;
};

const makeJob = (overrides: JobOverrides = {}) => ({
  _id: "job_abc12345",
  customerName: "Thabo",
  quote: 250,
  quoteStatus: "confirmed",
  customerEmail: "customer@example.com",
  ...overrides,
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

type FetchMock = ReturnType<typeof vi.fn<typeof stubFetch>>;

function stubFetch(
  input: RequestInfo | URL,
  _init?: RequestInit,
): Promise<Response> {
  const url = String(input);

  // jobs:get — the job lookup that decides everything below.
  if (url === `${CONVEX_URL}/api/query`) {
    return Promise.resolve(json({ value: currentJob }));
  }
  // jobs:setPaymentReference — post-checkout bookkeeping.
  if (url === `${CONVEX_URL}/api/mutation`) {
    return Promise.resolve(json({ status: "success" }));
  }
  if (url === PAYSTACK_INIT) {
    return Promise.resolve(
      json({ status: true, data: { authorization_url: CHECKOUT_URL } }),
    );
  }
  return Promise.reject(new Error(`unexpected network call: ${url}`));
}

let currentJob: ReturnType<typeof makeJob>;
let fetchMock: FetchMock;

const paystackCalls = () =>
  fetchMock.mock.calls.filter(([input]) =>
    String(input).includes("api.paystack.co"),
  );

const convexCalls = () =>
  fetchMock.mock.calls.filter(([input]) =>
    String(input).includes("/api/mutation"),
  );

const post = (body: unknown) =>
  initializePayment(
    new Request("https://kitfix.test/api/payments/initialize", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CONVEX_URL", CONVEX_URL);
  vi.stubEnv("PAYSTACK_SECRET_KEY", SECRET);
  vi.stubEnv("SITE_URL", "https://kitfix.test");
  currentJob = makeJob();
  fetchMock = vi.fn(stubFetch);
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("POST /api/payments/initialize — confirmed-quote guard", () => {
  it("refuses an estimate: no Paystack checkout is created", async () => {
    currentJob = makeJob({ quoteStatus: "estimate" });

    const res = await post({ jobId: currentJob._id });

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "quote not confirmed" });
    // The whole point: an estimate must never reach Paystack.
    expect(paystackCalls()).toHaveLength(0);
    expect(convexCalls()).toHaveLength(0);
  });

  it("refuses a job with no quoteStatus at all", async () => {
    currentJob = makeJob({ quoteStatus: undefined });

    const res = await post({ jobId: currentJob._id });

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "quote not confirmed" });
    expect(paystackCalls()).toHaveLength(0);
    expect(convexCalls()).toHaveLength(0);
  });

  it("refuses an already-paid job", async () => {
    currentJob = makeJob({ paymentStatus: "paid" });

    const res = await post({ jobId: currentJob._id });

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "already paid" });
    expect(paystackCalls()).toHaveLength(0);
  });

  it("refuses a job with no customer email", async () => {
    currentJob = makeJob({ customerEmail: undefined });

    const res = await post({ jobId: currentJob._id });

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: "missing customer email",
    });
    expect(paystackCalls()).toHaveLength(0);
  });

  it("refuses a confirmed job whose quote is not a number", async () => {
    currentJob = makeJob({ quote: null });

    const res = await post({ jobId: currentJob._id });

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "invalid quote" });
    expect(paystackCalls()).toHaveLength(0);
  });

  it("refuses a missing jobId without touching the network", async () => {
    const res = await post({});

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "invalid_request" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  // Positive control: proves the guard rejects *estimates*, not everything.
  it("creates a checkout for a confirmed quote and stores the reference", async () => {
    const res = await post({ jobId: currentJob._id });

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      authorization_url: string;
      reference: string;
    };
    expect(body.authorization_url).toBe(CHECKOUT_URL);
    expect(body.reference).toMatch(/^KF-JOB_ABC1-/);

    // Exactly one Paystack call, charging the confirmed quote in kobo-free ZAR cents
    // as the app already defines it.
    const calls = paystackCalls();
    expect(calls).toHaveLength(1);
    const [url, init] = calls[0];
    expect(String(url)).toBe(PAYSTACK_INIT);
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toMatchObject({
      email: "customer@example.com",
      amount: 250,
      currency: "ZAR",
      metadata: { jobId: currentJob._id },
    });
    expect(
      String((init?.headers as Record<string, string>)?.Authorization),
    ).toBe(`Bearer ${SECRET}`);

    // The reference is persisted back to the job.
    const mutations = convexCalls();
    expect(mutations).toHaveLength(1);
    expect(JSON.parse(String(mutations[0][1]?.body))).toMatchObject({
      path: "jobs:setPaymentReference",
      args: { id: currentJob._id, reference: body.reference },
    });
  });
});
