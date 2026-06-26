import { describe, expect, it } from "vitest";

// The selectAnalysisImageInput helper was inlined and removed when
// switching from Puter.js (client-side) to NVIDIA (server-side).
// All image selection now happens server-side in actions/ai-damage.ts.
// The analysis logic is tested via the server action integration tests.

describe("AI damage analysis", () => {
  it("placeholder — server action tests live in actions/__tests__/ai-damage.test.ts", () => {
    expect(true).toBe(true);
  });
});
