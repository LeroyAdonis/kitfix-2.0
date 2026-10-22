import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const ADMIN_PASSWORD = "SECRET_PASSWORD_123";
const LOCKOUT_MS = 15 * 60 * 1000;

vi.mock("next/headers", () => {
  const store: Record<string, string> = {};
  return {
    cookies: () => ({
      set: (name: string, value: string) => { store[name] = value; },
      get: (name: string) => (store[name] ? { value: store[name]} : undefined),
      has: (name: string) => name in store,
      delete: (name: string) => { delete store[name]; },
    }),
    __store: store,
  };
});

import { POST as adminLoginPOST } from "@/app/api/admin/login/route";

describe("Admin login rate limiting", () => {
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = ADMIN_PASSWORD;
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-22T15:00:00Z"));
  });

  afterEach(() => {
    delete process.env.ADMIN_PASSWORD;
    vi.useRealTimers();
  });

  it("correct password sets cookie and returns success", async () => {
    const req = new Request("https://kitfix.test/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "192.168.1.1",
      },
      body: JSON.stringify({ password: ADMIN_PASSWORD }),
    });

    const res = await adminLoginPOST(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
  });

  it("wrong password returns 401", async () => {
    const req = new Request("https://kitfix.test/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "wrong" }),
    });

    const res = await adminLoginPOST(req);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Invalid password" });
  });

  it("6th attempt within window is refused even with correct password", async () => {
    for (let i = 0; i < 5; i++) {
      const req = new Request("https://kitfix.test/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "192.168.1.1",
        },
        body: JSON.stringify({ password: "wrong" }),
      });
      await adminLoginPOST(req);
    }

    const req = new Request("https://kitfix.test/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "192.168.1.1",
      },
      body: JSON.stringify({ password: ADMIN_PASSWORD }),
    });

    const res = await adminLoginPOST(req);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Invalid password" });
  });

  it("clears lockout after window expires", async () => {
    for (let i = 0; i < 5; i++) {
      const req = new Request("https://kitfix.test/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "192.168.1.1",
        },
        body: JSON.stringify({ password: "wrong" }),
      });
      await adminLoginPOST(req);
    }

    vi.advanceTimersByTime(LOCKOUT_MS + 1);

    const req = new Request("https://kitfix.test/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "192.168.1.1",
      },
      body: JSON.stringify({ password: ADMIN_PASSWORD }),
    });

    const res = await adminLoginPOST(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
  });
});