import { describe, expect, it } from "vitest";

import { selectAnalysisImageInput } from "@/components/ai/damage-analyzer";

describe("selectAnalysisImageInput", () => {
  it("prefers uploaded File over preview data URL for AI analysis", () => {
    const file = new File(["image-bytes"], "jersey.jpg", { type: "image/jpeg" });
    const previewDataUrl = "data:image/jpeg;base64,abc123";

    const selected = selectAnalysisImageInput([file], [previewDataUrl]);

    expect(selected).toBe(file);
  });

  it("falls back to preview URL when File is unavailable", () => {
    const previewDataUrl = "https://example.com/jersey.jpg";

    const selected = selectAnalysisImageInput([], [previewDataUrl]);

    expect(selected).toBe(previewDataUrl);
  });
});
