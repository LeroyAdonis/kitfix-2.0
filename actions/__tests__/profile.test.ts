import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Hoisted mock — chainable db mock
// ---------------------------------------------------------------------------

const { mocks, mockDb } = vi.hoisted(() => {
  const returning = vi.fn().mockResolvedValue([]);
  const where = vi.fn(() => ({ returning }));
  const set = vi.fn(() => ({ where }));

  return {
    mocks: { returning, where, set },
    mockDb: {
      update: vi.fn(() => ({ set })),
    },
  };
});

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/auth-utils", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: mockDb,
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { getSession } from "@/lib/auth-utils";
import { updateProfileAction } from "../profile";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockSession(role = "customer", userId = "user-1") {
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

function createFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    fd.set(key, value);
  }
  return fd;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateProfileAction", () => {
  it("returns error when no session exists", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const fd = createFormData({ name: "New Name" });
    const result = await updateProfileAction(fd);

    expect(result).toEqual({
      success: false,
      error: "You must be signed in.",
    });
    expect(mockDb.update).not.toHaveBeenCalled();
  });

  it("returns validation error for name too short", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());

    const fd = createFormData({ name: "A" }); // min 2 characters
    const result = await updateProfileAction(fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Validation failed.");
      expect(result.fieldErrors).toBeDefined();
      expect(result.fieldErrors!["name"]).toBeDefined();
    }
  });

  it("returns validation error for empty name", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());

    const fd = createFormData({ name: "" });
    const result = await updateProfileAction(fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Validation failed.");
    }
  });

  it("updates the profile and returns the new name", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("customer", "user-99"));

    const fd = createFormData({ name: "Updated Name" });
    const result = await updateProfileAction(fd);

    expect(result).toEqual({
      success: true,
      data: { name: "Updated Name" },
    });
    expect(mockDb.update).toHaveBeenCalled();
    expect(mocks.set).toHaveBeenCalledWith({ name: "Updated Name" });
  });

  it("handles optional image field", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());

    const fd = createFormData({ name: "Valid Name", image: "" });
    const result = await updateProfileAction(fd);

    expect(result.success).toBe(true);
  });

  it("returns validation error for invalid image URL", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());

    const fd = createFormData({ name: "Valid Name", image: "not-a-url" });
    const result = await updateProfileAction(fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Validation failed.");
      expect(result.fieldErrors).toBeDefined();
    }
  });
});
