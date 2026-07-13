import { describe, it, expect, vi, beforeEach } from "vitest";

import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------

const { mockDb, mocks } = vi.hoisted(() => {
  const returning = vi.fn().mockResolvedValue([]);
  const where = vi.fn(() => ({ returning }));
  const set = vi.fn(() => ({ where }));
  const selectWhere = vi.fn().mockResolvedValue([]);
  const from = vi.fn(() => ({ where: selectWhere }));
  const findMany = vi.fn().mockResolvedValue([]);
  const findFirst = vi.fn().mockResolvedValue(null);

  return {
    mocks: { returning, where, set, selectWhere, from, findMany, findFirst },
    mockDb: {
      query: {
        repairRequests: { findFirst, findMany },
        voiceNotes: { findMany },
      },
      update: vi.fn(() => ({ set })),
      select: vi.fn(() => ({ from })),
      insert: vi.fn(() => ({ values: vi.fn(() => ({ returning })) })),
    },
  };
});

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
  headers: vi.fn(() => new Map()),
}));

vi.mock("@/lib/auth-utils", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: mockDb,
}));

vi.mock("@/lib/db/queries/repairs", () => ({
  getRepairById: vi.fn(),
}));

vi.mock("@/lib/db/queries/voice-notes", () => ({
  getVoiceNotesByRepair: vi.fn(),
  createVoiceNote: vi.fn(),
}));

vi.mock("@vercel/blob", () => ({
  put: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { getSession } from "@/lib/auth-utils";
import { getRepairById } from "@/lib/db/queries/repairs";
import {
  getVoiceNotesByRepair,
  createVoiceNote,
} from "@/lib/db/queries/voice-notes";
import { put } from "@vercel/blob";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockSession(
  role: "customer" | "admin" | "technician" = "customer",
  userId = "user-1",
) {
  return {
    user: {
      id: userId,
      name: "Test User",
      email: "test@example.com",
      role,
      emailVerified: true,
      image: null,
      banned: false,
      banReason: null,
      banExpires: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    session: {
      id: "sess-1",
      userId,
      token: "test-token",
      expiresAt: new Date(Date.now() + 86400000),
      ipAddress: null,
      userAgent: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      impersonatedBy: null,
    },
  };
}

function mockRepair(overrides: Record<string, unknown> = {}) {
  return {
    id: "repair-1",
    customerId: "user-1",
    customer: {
      id: "user-1",
      name: "Thabo",
      email: "thabo@example.com",
      role: "customer",
    },
    jerseyDescription: "Kaizer Chiefs home jersey 2023 season",
    currentStatus: "quality_check",
    ...overrides,
  } as unknown as NonNullable<Awaited<ReturnType<typeof getRepairById>>>;
}

function mockVoiceNote(overrides: Record<string, unknown> = {}) {
  return {
    id: "voice-1",
    repairRequestId: "repair-1",
    customerId: "user-1",
    statusAtGeneration: "quality_check",
    audioUrl: "https://blob.vercel.com/voice-note-123.wav",
    script: "Hi Thabo, great news! Your jersey repair is quality check.",
    durationMs: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// POST /api/voice/generate
// ---------------------------------------------------------------------------

describe("POST /api/voice/generate", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const { POST } = await import("../generate/route");

    const req = new NextRequest("http://localhost:3000/api/voice/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Hello", repairId: "repair-1" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Authentication required");
  });

  it("returns 400 when body is missing required fields", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());

    const { POST } = await import("../generate/route");

    const req = new NextRequest("http://localhost:3000/api/voice/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("text is required");
  });

  it("returns 400 when text is empty", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());

    const { POST } = await import("../generate/route");

    const req = new NextRequest("http://localhost:3000/api/voice/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "", repairId: "repair-1" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it("returns 404 when repair is not found", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    vi.mocked(getRepairById).mockResolvedValueOnce(null);

    const { POST } = await import("../generate/route");

    const req = new NextRequest("http://localhost:3000/api/voice/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Hello", repairId: "nonexistent" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Repair request not found");
  });

  it("returns 403 when user is not owner or admin", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(
      mockSession("customer", "user-other"),
    );
    vi.mocked(getRepairById).mockResolvedValueOnce(
      mockRepair({ customerId: "user-1" }),
    );

    const { POST } = await import("../generate/route");

    const req = new NextRequest("http://localhost:3000/api/voice/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Hello", repairId: "repair-1" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toContain("Forbidden");
  });

  it("returns 502 when TTS server is unreachable", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    vi.mocked(getRepairById).mockResolvedValueOnce(mockRepair());

    const origFetch = globalThis.fetch;
    globalThis.fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("Connection refused"));

    const { POST } = await import("../generate/route");

    const req = new NextRequest("http://localhost:3000/api/voice/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Hello", repairId: "repair-1" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error).toContain("Failed to reach TTS server");

    globalThis.fetch = origFetch;
  });

  it("generates voice note successfully", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    vi.mocked(getRepairById).mockResolvedValueOnce(mockRepair());

    const fakeWav = new Blob(["fake-wav-data"], { type: "audio/wav" });
    const origFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(fakeWav),
    } as Response);

    vi.mocked(put).mockResolvedValueOnce({
      url: "https://blob.vercel.com/voice-note-123.wav",
    } as Awaited<ReturnType<typeof put>>);

    vi.mocked(createVoiceNote).mockResolvedValueOnce(
      mockVoiceNote() as unknown as Awaited<ReturnType<typeof createVoiceNote>>,
    );

    const { POST } = await import("../generate/route");

    const req = new NextRequest("http://localhost:3000/api/voice/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Hi Thabo", repairId: "repair-1" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.audioUrl).toBe(
      "https://blob.vercel.com/voice-note-123.wav",
    );
    expect(json.data.id).toBe("voice-1");
  });
});

// ---------------------------------------------------------------------------
// GET /api/voice
// ---------------------------------------------------------------------------

describe("GET /api/voice", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const { GET } = await import("../route");

    const req = new NextRequest(
      "http://localhost:3000/api/voice?repairId=repair-1",
    );
    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  it("returns 400 when repairId is missing", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());

    const { GET } = await import("../route");

    const req = new NextRequest("http://localhost:3000/api/voice");
    const res = await GET(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("repairId");
  });

  it("returns 404 when repair is not found", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    vi.mocked(getRepairById).mockResolvedValueOnce(null);

    const { GET } = await import("../route");

    const req = new NextRequest(
      "http://localhost:3000/api/voice?repairId=nonexistent",
    );
    const res = await GET(req);

    expect(res.status).toBe(404);
  });

  it("returns voice notes for the repair", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    vi.mocked(getRepairById).mockResolvedValueOnce(mockRepair());
    vi.mocked(getVoiceNotesByRepair).mockResolvedValueOnce([
      mockVoiceNote(),
    ] as never);

    const { GET } = await import("../route");

    const req = new NextRequest(
      "http://localhost:3000/api/voice?repairId=repair-1",
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(json.data[0].id).toBe("voice-1");
  });
});

// ---------------------------------------------------------------------------
// POST /api/voice (trigger)
// ---------------------------------------------------------------------------

describe("POST /api/voice (trigger)", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const { POST } = await import("../route");

    const req = new NextRequest("http://localhost:3000/api/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repairId: "repair-1" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it("returns 403 when user is not admin/technician", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("customer"));

    const { POST } = await import("../route");

    const req = new NextRequest("http://localhost:3000/api/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repairId: "repair-1" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(403);
  });

  it("returns 400 when repairId is missing", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("admin"));

    const { POST } = await import("../route");

    const req = new NextRequest("http://localhost:3000/api/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });
});
