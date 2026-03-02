import { updateProfileSchema } from "../profile";

describe("updateProfileSchema", () => {
  // --- Happy paths ---

  it("accepts a valid name", () => {
    const result = updateProfileSchema.safeParse({ name: "Sipho Mbeki" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Sipho Mbeki");
    }
  });

  it("accepts a valid name with image URL", () => {
    const result = updateProfileSchema.safeParse({
      name: "Thandi",
      image: "https://example.com/photo.jpg",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.image).toBe("https://example.com/photo.jpg");
    }
  });

  it("allows image to be an empty string (clear avatar)", () => {
    const result = updateProfileSchema.safeParse({
      name: "Thandi",
      image: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.image).toBe("");
    }
  });

  it("allows image to be omitted", () => {
    const result = updateProfileSchema.safeParse({ name: "Thandi" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.image).toBeUndefined();
    }
  });

  // --- Name validation ---

  it("rejects name shorter than 2 characters", () => {
    const result = updateProfileSchema.safeParse({ name: "A" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameIssue = result.error.issues.find((i) =>
        i.path.includes("name"),
      );
      expect(nameIssue).toBeDefined();
    }
  });

  it("accepts name at exactly 2 characters", () => {
    const result = updateProfileSchema.safeParse({ name: "Ab" });
    expect(result.success).toBe(true);
  });

  it("accepts name at exactly 100 characters", () => {
    const result = updateProfileSchema.safeParse({ name: "A".repeat(100) });
    expect(result.success).toBe(true);
  });

  it("rejects name longer than 100 characters", () => {
    const result = updateProfileSchema.safeParse({ name: "A".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = updateProfileSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = updateProfileSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  // --- Image URL validation ---

  it("rejects a non-URL image string", () => {
    const result = updateProfileSchema.safeParse({
      name: "Thandi",
      image: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts an https image URL", () => {
    const result = updateProfileSchema.safeParse({
      name: "Thandi",
      image: "https://cdn.example.com/avatar.png",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an http image URL", () => {
    const result = updateProfileSchema.safeParse({
      name: "Thandi",
      image: "http://cdn.example.com/avatar.png",
    });
    expect(result.success).toBe(true);
  });
});
