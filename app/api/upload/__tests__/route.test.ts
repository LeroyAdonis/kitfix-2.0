import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Hoisted mock — chainable db mock for db.insert().values().returning()
// ---------------------------------------------------------------------------

const { mocks, mockDb } = vi.hoisted(() => {
  const returning = vi.fn().mockResolvedValue([]);
  const values = vi.fn(() => ({ returning }));

  return {
    mocks: { returning, values },
    mockDb: {
      insert: vi.fn(() => ({ values })),
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

vi.mock("@/lib/upload", () => ({
  uploadPhoto: vi.fn(),
  validateUploadFile: vi.fn(),
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"],
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { getSession } from "@/lib/auth-utils";
import { uploadPhoto, validateUploadFile } from "@/lib/upload";
import { POST } from "../../upload/route";

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

function createMockFile(
  name: string,
  sizeBytes: number,
  type: string,
): File {
  const buffer = new ArrayBuffer(sizeBytes);
  return new File([buffer], name, { type });
}

function createMockRequest(formData: FormData): NextRequest {
  return {
    formData: vi.fn().mockResolvedValue(formData),
  } as unknown as NextRequest;
}

function createMockRequestInvalidFormData(): NextRequest {
  return {
    formData: vi.fn().mockRejectedValue(new Error("Invalid form data")),
  } as unknown as NextRequest;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  mocks.returning.mockResolvedValue([]);
});

describe("POST /api/upload", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const fd = new FormData();
    const response = await POST(createMockRequest(fd));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Authentication required");
  });

  it("returns 400 when form data is invalid", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());

    const response = await POST(createMockRequestInvalidFormData());
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid form data");
  });

  it("returns 400 when file is missing", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());

    const fd = new FormData();
    fd.set("repairRequestId", "repair-1");
    fd.set("photoType", "before");
    // No file set

    const response = await POST(createMockRequest(fd));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Missing or invalid file");
  });

  it("returns 400 when file is not a File instance", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());

    const fd = new FormData();
    fd.set("file", "not-a-file");
    fd.set("repairRequestId", "repair-1");
    fd.set("photoType", "before");

    const response = await POST(createMockRequest(fd));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Missing or invalid file");
  });

  it("returns 400 when repairRequestId is missing", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());

    const fd = new FormData();
    fd.set("file", createMockFile("photo.jpg", 1024, "image/jpeg"));
    fd.set("photoType", "before");

    const response = await POST(createMockRequest(fd));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Missing repairRequestId");
  });

  it("returns 400 when repairRequestId is empty", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());

    const fd = new FormData();
    fd.set("file", createMockFile("photo.jpg", 1024, "image/jpeg"));
    fd.set("repairRequestId", "  ");
    fd.set("photoType", "before");

    const response = await POST(createMockRequest(fd));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Missing repairRequestId");
  });

  it("returns 400 when photoType is invalid", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());

    const fd = new FormData();
    fd.set("file", createMockFile("photo.jpg", 1024, "image/jpeg"));
    fd.set("repairRequestId", "repair-1");
    fd.set("photoType", "selfie"); // invalid

    const response = await POST(createMockRequest(fd));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("Invalid photoType");
  });

  it("returns 400 when photoType is missing", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());

    const fd = new FormData();
    fd.set("file", createMockFile("photo.jpg", 1024, "image/jpeg"));
    fd.set("repairRequestId", "repair-1");
    // No photoType

    const response = await POST(createMockRequest(fd));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("Invalid photoType");
  });

  it("returns 400 when file validation fails", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    vi.mocked(validateUploadFile).mockReturnValueOnce({
      field: "size",
      message: "File too large (15.0 MB). Maximum allowed: 10 MB.",
    });

    const fd = new FormData();
    fd.set("file", createMockFile("huge.jpg", 15 * 1024 * 1024, "image/jpeg"));
    fd.set("repairRequestId", "repair-1");
    fd.set("photoType", "before");

    const response = await POST(createMockRequest(fd));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("File too large");
  });

  it("returns 201 with photo data on successful upload", async () => {
    const photoRecord = {
      id: "photo-1",
      repairRequestId: "repair-1",
      url: "https://blob.vercel-storage.com/kitfix/photos/photo.jpg",
      thumbnailUrl: null,
      originalFilename: "photo.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 1024,
      photoType: "before",
      uploadedBy: "user-1",
      createdAt: new Date(),
    };

    vi.mocked(getSession).mockResolvedValueOnce(mockSession("customer", "user-1"));
    vi.mocked(validateUploadFile).mockReturnValueOnce(null);
    vi.mocked(uploadPhoto).mockResolvedValueOnce({
      url: "https://blob.vercel-storage.com/kitfix/photos/photo.jpg",
      downloadUrl: "https://blob.vercel-storage.com/kitfix/photos/photo.jpg",
      pathname: "kitfix/photos/photo.jpg",
      contentType: "image/jpeg",
      contentDisposition: "inline",
    } as unknown as Awaited<ReturnType<typeof uploadPhoto>>);
    mocks.returning.mockResolvedValueOnce([photoRecord]);

    const fd = new FormData();
    fd.set("file", createMockFile("photo.jpg", 1024, "image/jpeg"));
    fd.set("repairRequestId", "repair-1");
    fd.set("photoType", "before");

    const response = await POST(createMockRequest(fd));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe("photo-1");
    expect(uploadPhoto).toHaveBeenCalled();
  });

  it("returns 500 when upload throws", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    vi.mocked(validateUploadFile).mockReturnValueOnce(null);
    vi.mocked(uploadPhoto).mockRejectedValueOnce(new Error("Blob storage unavailable"));

    const fd = new FormData();
    fd.set("file", createMockFile("photo.jpg", 1024, "image/jpeg"));
    fd.set("repairRequestId", "repair-1");
    fd.set("photoType", "before");

    const response = await POST(createMockRequest(fd));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Blob storage unavailable");
  });

  it("accepts all valid photo types: before, during, after", async () => {
    for (const photoType of ["before", "during", "after"]) {
      vi.clearAllMocks();
      vi.mocked(getSession).mockResolvedValueOnce(mockSession());
      vi.mocked(validateUploadFile).mockReturnValueOnce(null);
      vi.mocked(uploadPhoto).mockResolvedValueOnce({
        url: "https://blob.vercel-storage.com/test.jpg",
        downloadUrl: "https://blob.vercel-storage.com/test.jpg",
        pathname: "test.jpg",
        contentType: "image/jpeg",
        contentDisposition: "inline",
      } as unknown as Awaited<ReturnType<typeof uploadPhoto>>);
      mocks.returning.mockResolvedValueOnce([
        {
          id: `photo-${photoType}`,
          repairRequestId: "repair-1",
          url: "https://blob.vercel-storage.com/test.jpg",
          thumbnailUrl: null,
          originalFilename: "photo.jpg",
          mimeType: "image/jpeg",
          sizeBytes: 1024,
          photoType,
          uploadedBy: "user-1",
          createdAt: new Date(),
        },
      ]);

      const fd = new FormData();
      fd.set("file", createMockFile("photo.jpg", 1024, "image/jpeg"));
      fd.set("repairRequestId", "repair-1");
      fd.set("photoType", photoType);

      const response = await POST(createMockRequest(fd));
      expect(response.status).toBe(201);
    }
  });
});
