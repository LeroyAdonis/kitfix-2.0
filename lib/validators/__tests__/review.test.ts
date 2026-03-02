import { createReviewSchema } from "../review";

/** Minimal valid review input */
const validReview = {
  repairRequestId: "req_abc123",
  rating: 4,
};

describe("createReviewSchema", () => {
  // --- Happy paths ---

  it("accepts a valid review without comment", () => {
    const result = createReviewSchema.safeParse(validReview);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rating).toBe(4);
      expect(result.data.comment).toBeUndefined();
    }
  });

  it("accepts a valid review with comment", () => {
    const result = createReviewSchema.safeParse({
      ...validReview,
      comment: "Great repair, looks brand new!",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.comment).toBe("Great repair, looks brand new!");
    }
  });

  // --- Rating range (1-5 inclusive) ---

  it.each([1, 2, 3, 4, 5])("accepts rating %d", (rating) => {
    const result = createReviewSchema.safeParse({ ...validReview, rating });
    expect(result.success).toBe(true);
  });

  it("rejects rating 0 (below minimum)", () => {
    const result = createReviewSchema.safeParse({ ...validReview, rating: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects rating 6 (above maximum)", () => {
    const result = createReviewSchema.safeParse({ ...validReview, rating: 6 });
    expect(result.success).toBe(false);
  });

  it("rejects negative rating", () => {
    const result = createReviewSchema.safeParse({ ...validReview, rating: -1 });
    expect(result.success).toBe(false);
  });

  // --- Rating must be integer ---

  it("rejects non-integer rating (3.5)", () => {
    const result = createReviewSchema.safeParse({
      ...validReview,
      rating: 3.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer rating (1.1)", () => {
    const result = createReviewSchema.safeParse({
      ...validReview,
      rating: 1.1,
    });
    expect(result.success).toBe(false);
  });

  // --- Required fields ---

  it("rejects missing repairRequestId", () => {
    const result = createReviewSchema.safeParse({ rating: 4 });
    expect(result.success).toBe(false);
  });

  it("rejects empty repairRequestId", () => {
    const result = createReviewSchema.safeParse({
      repairRequestId: "",
      rating: 4,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing rating", () => {
    const result = createReviewSchema.safeParse({
      repairRequestId: "req_abc123",
    });
    expect(result.success).toBe(false);
  });

  // --- Comment constraints ---

  it("accepts comment at exactly 1000 characters", () => {
    const result = createReviewSchema.safeParse({
      ...validReview,
      comment: "A".repeat(1000),
    });
    expect(result.success).toBe(true);
  });

  it("rejects comment longer than 1000 characters", () => {
    const result = createReviewSchema.safeParse({
      ...validReview,
      comment: "A".repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty comment string", () => {
    const result = createReviewSchema.safeParse({
      ...validReview,
      comment: "",
    });
    expect(result.success).toBe(true);
  });
});
