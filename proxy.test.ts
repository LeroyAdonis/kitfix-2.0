/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

// We must mock the DB module BEFORE the proxy module is imported
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(),
  },
}));

describe("proxy", () => {
  let proxy: (req: NextRequest) => Promise<NextResponse>;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Dynamic import so mocks are in place
    const mod = await import("./proxy");
    proxy = mod.proxy;
  });

  const makeRequest = (pathname: string, cookie?: string) => {
    const url = new URL(`http://localhost:3000${pathname}`);
    return {
      nextUrl: { pathname },
      url: url.toString(),
      headers: new Map<string, string>(cookie ? [["cookie", cookie]] : []),
    } as unknown as NextRequest;
  };

  it("REDIRECTS unauthenticated /dashboard to /sign-in", async () => {
    const req = makeRequest("/dashboard");
    const res = await proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("Location")).toContain("/sign-in?callbackUrl=%2Fdashboard");
  });

  it("ALLOWS public /sign-in without redirect", async () => {
    const req = makeRequest("/sign-in");
    const res = await proxy(req);

    expect(res.status).toBe(200);
  });

  it("ALLOWS public /sign-up without redirect", async () => {
    const req = makeRequest("/sign-up");
    const res = await proxy(req);

    expect(res.status).toBe(200);
  });

  it("ALLOWS home page / without redirect", async () => {
    const req = makeRequest("/");
    const res = await proxy(req);

    expect(res.status).toBe(200);
  });

  it("REDIRECTS /admin to /sign-in for unauthenticated", async () => {
    const req = makeRequest("/admin");
    const res = await proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("Location")).toContain("/sign-in?callbackUrl=%2Fadmin");
  });

  it("REDIRECTS /repairs/new to /sign-in with encoded callbackUrl", async () => {
    const req = makeRequest("/repairs/new");
    const res = await proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("Location")).toContain("/sign-in?callbackUrl=%2Frepairs%2Fnew");
  });

  it("ALLOWS /dashboard when valid session cookie exists", async () => {
    // Create a real signed JWT for the test
    const { createSessionToken } = await import("@/lib/auth-jwt");
    const token = await createSessionToken({ userId: "u1", role: "customer", sessionId: "s1", name: "Test User" });

    const req = makeRequest(
      "/dashboard",
      `better-auth.session_token=${token}`
    );
    const res = await proxy(req);

    expect(res.status).toBe(200);
  });
});
