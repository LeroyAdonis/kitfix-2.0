"use server";

import { authenticatedAction } from "@/lib/auth-utils";
import type { SmartRepairExtraction } from "@/types/ai";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const SYSTEM_PROMPT = `You are a smart jersey repair assistant. Given a user's natural language description of what needs fixing on their jersey, extract structured repair information.

Return ONLY a JSON object (no markdown, no extra text) with these exact keys:
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

"{{DESCRIPTION}}"

Photos uploaded: {{HAS_PHOTOS}}

Return the JSON only.`;

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

  if (!DEEPSEEK_API_KEY) {
    return {
      success: false,
      error:
        "AI extraction is not configured. Please contact support.",
    };
  }

  try {
    const prompt = USER_PROMPT_TEMPLATE.replace(
      "{{DESCRIPTION}}",
      description.trim(),
    ).replace("{{HAS_PHOTOS}}", photoCount > 0 ? `Yes (${photoCount} photo(s))` : "No");

    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
          temperature: 0.15,
          max_tokens: 600,
        }),
      },
    );

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

    // Parse JSON from response
    const cleaned = rawText
      .replace(/```(?:json)?\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { success: false, error: "Could not parse AI response." };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate damage type
    const validDamageTypes = [
      "tear",
      "hole",
      "stain",
      "fading",
      "logo_damage",
      "seam_split",
      "other",
    ];
    const validUrgencyLevels = ["standard", "rush", "emergency"];
    const validSizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

    const extraction: SmartRepairExtraction = {
      jerseyDescription: parsed.jerseyDescription ?? description.trim(),
      jerseyBrand: validBrand(parsed.jerseyBrand) ?? null,
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
