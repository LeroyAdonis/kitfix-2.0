"use server";

import { getSession } from "@/lib/auth-utils";
import type { AIDamageAssessment } from "@/types/ai";

interface NVidiaVisionResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_MODEL = process.env.NVIDIA_VISION_MODEL ?? "nvidia/nemotron-vision";
const NVIDIA_ENDPOINT = `https://ai.api.nvidia.com/v1/vlm/${NVIDIA_MODEL}`;

const SYSTEM_PROMPT = `You are a jersey repair damage assessment expert. Analyze the jersey photo and return ONLY a JSON object (no markdown, no extra text) with these exact keys:
- "damageType": one of "tear", "hole", "stain", "fading", "logo_damage", "seam_split", "other"
- "severity": one of "minor", "moderate", "severe"
- "affectedArea": one of "front", "back", "sleeve", "collar", "hem", "multiple"
- "repairability": one of "easy", "moderate", "difficult"
- "description": a brief 1-2 sentence description of the damage seen`;

export async function analyzeDamageAction(
  imageUrl: string,
): Promise<{ success: true; data: AIDamageAssessment } | { success: false; error: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "You must be signed in." };

  if (!NVIDIA_API_KEY) {
    return { success: false, error: "AI analysis is not configured. Please set NVIDIA_API_KEY." };
  }

  try {
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
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: imageUrl } },
              { type: "text", text: "Analyze this jersey for repair damage." },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown error");
      return { success: false, error: `AI service returned ${response.status}: ${errText.slice(0, 200)}` };
    }

    const data: NVidiaVisionResponse = await response.json();
    const rawText = data.choices?.[0]?.message?.content;

    if (!rawText) {
      return { success: false, error: "AI returned an empty response." };
    }

    // Parse JSON from response
    const cleaned = rawText.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { success: false, error: "Could not parse AI response." };

    const parsed = JSON.parse(jsonMatch[0]);

    const validDamageTypes = ["tear", "hole", "stain", "fading", "logo_damage", "seam_split", "other"];
    const validSeverities = ["minor", "moderate", "severe"];
    const validAreas = ["front", "back", "sleeve", "collar", "hem", "multiple"];
    const validRepairability = ["easy", "moderate", "difficult"];

    const assessment: AIDamageAssessment = {
      damageType: validDamageTypes.includes(parsed.damageType) ? parsed.damageType : "other",
      severity: validSeverities.includes(parsed.severity) ? parsed.severity : "moderate",
      affectedArea: validAreas.includes(parsed.affectedArea) ? parsed.affectedArea : "front",
      repairability: validRepairability.includes(parsed.repairability) ? parsed.repairability : "moderate",
      confidence: 0.75,
      description: parsed.description ?? "",
      rawResponse: rawText,
    };

    return { success: true, data: assessment };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
