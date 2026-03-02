import {
  validateUploadFile,
  MAX_FILE_SIZE,
  ALLOWED_TYPES,
} from "../upload";

// ---------------------------------------------------------------------------
// Helper to create a mock File
// ---------------------------------------------------------------------------

function createMockFile(
  name: string,
  sizeBytes: number,
  type: string,
): File {
  // Create a buffer of the exact size
  const buffer = new ArrayBuffer(sizeBytes);
  return new File([buffer], name, { type });
}

// ---------------------------------------------------------------------------
// validateUploadFile()
// ---------------------------------------------------------------------------

describe("validateUploadFile()", () => {
  // --- Constants sanity check ---

  it("MAX_FILE_SIZE is 10 MB", () => {
    expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
  });

  it("ALLOWED_TYPES contains jpeg, png, webp", () => {
    expect(ALLOWED_TYPES).toContain("image/jpeg");
    expect(ALLOWED_TYPES).toContain("image/png");
    expect(ALLOWED_TYPES).toContain("image/webp");
    expect(ALLOWED_TYPES).toHaveLength(3);
  });

  // --- Valid files ---

  it("returns null for a valid JPEG file", () => {
    const file = createMockFile("photo.jpg", 5 * 1024 * 1024, "image/jpeg");
    expect(validateUploadFile(file)).toBeNull();
  });

  it("returns null for a valid PNG file", () => {
    const file = createMockFile("logo.png", 2 * 1024 * 1024, "image/png");
    expect(validateUploadFile(file)).toBeNull();
  });

  it("returns null for a valid WebP file", () => {
    const file = createMockFile("photo.webp", 1 * 1024 * 1024, "image/webp");
    expect(validateUploadFile(file)).toBeNull();
  });

  it("returns null for a file at exactly MAX_FILE_SIZE", () => {
    const file = createMockFile("exact.jpg", MAX_FILE_SIZE, "image/jpeg");
    expect(validateUploadFile(file)).toBeNull();
  });

  it("returns null for a very small file (1 byte)", () => {
    const file = createMockFile("tiny.png", 1, "image/png");
    expect(validateUploadFile(file)).toBeNull();
  });

  // --- Invalid MIME types ---

  it("rejects a GIF file", () => {
    const file = createMockFile("anim.gif", 1024, "image/gif");
    const error = validateUploadFile(file);
    expect(error).not.toBeNull();
    expect(error!.field).toBe("type");
    expect(error!.message).toContain("image/gif");
  });

  it("rejects a PDF file", () => {
    const file = createMockFile("doc.pdf", 1024, "application/pdf");
    const error = validateUploadFile(file);
    expect(error).not.toBeNull();
    expect(error!.field).toBe("type");
    expect(error!.message).toContain("application/pdf");
  });

  it("rejects a text file", () => {
    const file = createMockFile("readme.txt", 100, "text/plain");
    const error = validateUploadFile(file);
    expect(error).not.toBeNull();
    expect(error!.field).toBe("type");
  });

  it("rejects a file with empty MIME type", () => {
    const file = createMockFile("mystery", 100, "");
    const error = validateUploadFile(file);
    expect(error).not.toBeNull();
    expect(error!.field).toBe("type");
  });

  // --- Oversized files ---

  it("rejects a file 1 byte over MAX_FILE_SIZE", () => {
    const file = createMockFile(
      "large.jpg",
      MAX_FILE_SIZE + 1,
      "image/jpeg",
    );
    const error = validateUploadFile(file);
    expect(error).not.toBeNull();
    expect(error!.field).toBe("size");
    expect(error!.message).toContain("too large");
  });

  it("rejects a 20 MB file", () => {
    const file = createMockFile(
      "huge.png",
      20 * 1024 * 1024,
      "image/png",
    );
    const error = validateUploadFile(file);
    expect(error).not.toBeNull();
    expect(error!.field).toBe("size");
    expect(error!.message).toContain("10 MB");
  });

  it("includes the actual file size in the error message", () => {
    const sizeBytes = 15 * 1024 * 1024; // 15 MB
    const file = createMockFile("big.webp", sizeBytes, "image/webp");
    const error = validateUploadFile(file);
    expect(error).not.toBeNull();
    expect(error!.message).toContain("15.0");
  });

  // --- Type error takes precedence over size ---

  it("reports type error when both type and size are invalid", () => {
    // Invalid type is checked first in the implementation
    const file = createMockFile(
      "bad.svg",
      MAX_FILE_SIZE + 1000,
      "image/svg+xml",
    );
    const error = validateUploadFile(file);
    expect(error).not.toBeNull();
    expect(error!.field).toBe("type");
  });
});
