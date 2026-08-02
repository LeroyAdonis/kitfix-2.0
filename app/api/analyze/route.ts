import { NextResponse } from "next/server";

const NIM_ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL = "meta/llama-3.2-11b-vision-instruct";

const DAMAGE_TYPES = ["tear", "hole", "stain", "fading", "logo_damage", "seam_split", "other"];
const PRICE_BY_TIER: Record<string, number> = {
  Basic: 15000,
  Complex: 25000,
  "Full Refresh": 40000,
};

type Analysis = {
  damageType: string;
  description: string;
  suggestedTier: string;
  suggestedPrice: number;
  confidence: number;
};

function cleanJson(raw: string): string {
  return raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

function validateAnalysis(input: unknown): Analysis | null {
  if (typeof input !== "object" || input === null) return null;
  const o = input as Record<string, unknown>;

  const damageType =
    typeof o.damageType === "string" ? o.damageType.toLowerCase() : "";
  const requestedTier =
    typeof o.suggestedTier === "string" ? o.suggestedTier : "";

  const validDamage = DAMAGE_TYPES.includes(damageType)
    ? damageType
    : damageType === "logo damage"
      ? "logo_damage"
      : "other";

  const tier =
    requestedTier === "Basic" || requestedTier === "Complex" || requestedTier === "Full Refresh"
      ? requestedTier
      : "Complex";

  const parsedPrice = Number(o.suggestedPrice);
  const suggestedPrice = Number.isFinite(parsedPrice)
    ? parsedPrice
    : PRICE_BY_TIER[tier] ?? 25000;

  const parsedConfidence = Number(o.confidence);
  const confidence = Number.isFinite(parsedConfidence)
    ? Math.min(1, Math.max(0, parsedConfidence))
    : 0.5;

  return {
    damageType: validDamage,
    description:
      typeof o.description === "string" ? o.description : "Damage identified.",
    suggestedTier: tier,
    suggestedPrice,
    confidence,
  };
}

export async function POST(req: Request) {
  let photoStorageIds: string[];
  try {
    const body = await req.json();
    if (!Array.isArray(body.photoStorageIds) || body.photoStorageIds.length === 0) {
      return NextResponse.json({ error: "analysis_failed" }, { status: 400 });
    }
    photoStorageIds = body.photoStorageIds.filter(
      (s: unknown): s is string => typeof s === "string" && s.length > 0,
    );
    if (photoStorageIds.length === 0) {
      return NextResponse.json({ error: "analysis_failed" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "analysis_failed" }, { status: 400 });
  }

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
  }

  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    const storageUrl = `${convexUrl}/api/storage/${photoStorageIds[0]}`;

    const imageRes = await fetch(storageUrl, { cache: "no-store" });
    if (!imageRes.ok) {
      return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
    }
    const contentType = imageRes.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await imageRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:${contentType};base64,${base64}`;

    const prompt =
      `Analyze this photograph of a sports jersey. Identify the damage.\n` +
      `Respond with ONLY valid JSON (no markdown, no prose), exactly in this shape:\n` +
      `{"damageType": "tear"|"hole"|"stain"|"fading"|"logo_damage"|"seam_split"|"other", ` +
      `"description": "one short sentence describing the damage", ` +
      `"suggestedTier": "Basic"|"Complex"|"Full Refresh", ` +
      `"suggestedPrice": 15000|25000|40000, ` +
      `"confidence": 0.0}` +
      `Suggested price must be in cents: Basic=15000, Complex=25000, Full Refresh=40000.`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    const nimRes = await fetch(NIM_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: dataUrl },
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 300,
      }),
    });
    clearTimeout(timer);

    if (!nimRes.ok) {
      return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
    }

    const nimData = await nimRes.json();
    const content = nimData?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleanJson(content));
    } catch {
      return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
    }

    const analysis = validateAnalysis(parsed);
    if (!analysis) {
      return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
    }

    return NextResponse.json({ ...analysis, model: MODEL });
  } catch {
    return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
  }
}