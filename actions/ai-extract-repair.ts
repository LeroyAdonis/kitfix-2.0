"use server";

import type { SmartRepairExtraction } from "@/types/ai";

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_MODEL = process.env.NVIDIA_TEXT_MODEL ?? "mistralai/ministral-14b-instruct-2512";
const NVIDIA_ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions";

const SYSTEM_PROMPT = `You are a smart jersey repair assistant. Given a user's natural language description of what needs fixing on their jersey, extract structured repair information.

Return ONLY a valid JSON object (no markdown, no code fences, no extra text) with these exact keys:
- "jerseyDescription": The full description of the jersey (team, year, colors, style)
- "jerseyBrand": The brand if mentioned (Adidas, Nike, Puma, etc.) or null if not specified
- "jerseySize": The size if mentioned (XS, S, M, L, XL, 2XL, 3XL) or null if not specified
- "damageType": One of: "tear", "hole", "stain", "fading", "logo_damage", "seam_split", "other"
- "damageDescription": Detailed description of the damage based on what the user said
- "urgencyLevel": One of: "standard" (7-14 days), "rush" (3-5 days), "emergency" (1-2 days). Infer from language like "urgent", "asap", "soon" → rush; "need it immediately", "emergency" → emergency; default "standard"
- "shippingAddress": null always — we don't extract addresses from descriptions
- "confidence": A number 0-1 indicating how confident you are in the extraction
- "missingInfo": An array of strings listing what important info is MISSING. E.g. if no size mentioned, include "jersey size". Always evaluate if there's enough info to proceed.`;

const USER_PROMPT_TEMPLATE = `Extract repair information from this user description:

"""
{{DESCRIPTION}}
"""

Photos uploaded: {{HAS_PHOTOS}}

Return the JSON object only — no markdown, no code fences, no explanation.`;

export async function extractRepairAction(
  description: string,
  photoCount: number = 0,
): Promise<
  | { success: true; data: SmartRepairExtraction }
  | { success: false; error: string }
> {
  if (!description?.trim()) {
    return { success: false, error: "Please describe what needs fixing." };
  }

  if (!NVIDIA_API_KEY) {
    return {
      success: false,
      error: "AI extraction is not configured. Please contact support.",
    };
  }

  try {
    const prompt = USER_PROMPT_TEMPLATE.replace(
      "{{DESCRIPTION}}",
      description.trim(),
    ).replace("{{HAS_PHOTOS}}", photoCount > 0 ? `Yes (${photoCount} photo(s))` : "No");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s before Vercel's 10s limit

    const response = await fetch(NVIDIA_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown error");
      return {
        success: false,
        error: `AI service returned ${response.status}: ${errText.slice(0, 200)}`,
      };
    }

    const data = await response.json();
    const rawText =
      data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text;

    if (!rawText) {
      return { success: false, error: "AI returned an empty response." };
    }

    // Parse JSON from response — strip any markdown fences first
    const cleaned = rawText
      .replace(/```(?:json)?\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { success: false, error: "Could not parse AI response." };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate values
    const validDamageTypes = [
      "tear", "hole", "stain", "fading",
      "logo_damage", "seam_split", "other",
    ];
    const validUrgencyLevels = ["standard", "rush", "emergency"];
    const validSizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

    const extraction: SmartRepairExtraction = {
      jerseyDescription: parsed.jerseyDescription ?? description.trim(),
      jerseyBrand: validBrand(parsed.jerseyBrand),
      jerseySize: validSizes.includes(parsed.jerseySize)
        ? parsed.jerseySize
        : null,
      damageType: validDamageTypes.includes(parsed.damageType)
        ? parsed.damageType
        : "other",
      damageDescription: parsed.damageDescription ?? description.trim(),
      urgencyLevel: validUrgencyLevels.includes(parsed.urgencyLevel)
        ? parsed.urgencyLevel
        : "standard",
      shippingAddress: null,
      confidence: Math.min(Math.max(parsed.confidence ?? 0.5, 0), 1),
      missingInfo: Array.isArray(parsed.missingInfo) ? parsed.missingInfo : [],
    };

    return { success: true, data: extraction };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

function validBrand(brand: unknown): string | null {
  if (!brand || typeof brand !== "string") return null;
  const trimmed = brand.trim();
  return trimmed.length > 0 ? trimmed : null;
}
