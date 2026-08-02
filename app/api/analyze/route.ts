import { NextResponse } from "next/server";

const NIM_ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions";
// Bake-off 2026-08-02 (6 vision models on NVIDIA NIM): llama-3.2-90b-vision-instruct
// won — correct damage/tier/price with confidence 0.80 vs 11b's 0.00. See
// /tmp/vision-bakeoff.py + .specify/specs/customer-portal/plan.md.
const MODEL = "meta/llama-3.2-90b-vision-instruct";

const DAMAGE_TYPES = ["tear", "hole", "stain", "fading", "print_damage", "logo_damage", "seam_split", "other"];
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
      : damageType === "peeling" ||
          damageType === "peeling print" ||
          damageType === "print peeling"
        ? "print_damage"
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
  let customerDescription = "";
  try {
    const body = await req.json();
    customerDescription =
      typeof body.description === "string" ? body.description.trim() : "";
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

    // Resolve storage ID → signed URL via Convex query (raw /api/storage/{id} is invalid)
    const resolveRes = await fetch(`${convexUrl}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "jobs:getPhotoUrl",
        args: { storageId: photoStorageIds[0] },
      }),
    });
    if (!resolveRes.ok) {
      return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
    }
    const resolveData = await resolveRes.json();
    const storageUrl = resolveData?.value ?? resolveData?.result;
    if (typeof storageUrl !== "string") {
      return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
    }

    const imageRes = await fetch(storageUrl, { cache: "no-store" });
    if (!imageRes.ok) {
      return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
    }
    const contentType = imageRes.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await imageRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:${contentType};base64,${base64}`;

    const customerHint = customerDescription
      ? `The customer also wrote: "${customerDescription}". Use this as a strong hint — confirm what they describe is visible in the photo and include it in your analysis. If the photo is unclear but the description is specific, trust the description.\n`
      : "";

    const prompt =
      `You are KitFix, a South African sports jersey repair specialist. Analyze the photograph of a sports jersey to identify all damage.\n` +
      customerHint +
      `Respond with ONLY valid JSON (no markdown, no prose), exactly in this shape:\n` +
      `{"damageType": "tear"|"hole"|"stain"|"fading"|"print_damage"|"logo_damage"|"seam_split"|"other", ` +
      `"description": "one short sentence describing the damage", ` +
      `"suggestedTier": "Basic"|"Complex"|"Full Refresh", ` +
      `"suggestedPrice": 15000|25000|40000, ` +
      `"confidence": 0.0}` +
      `\nNote: print_damage = peeling/peeling vinyl/peeling print/heat-press damage.` +
      `\nTier guide — Basic (R150): one small repair (single tear under 5cm, one small stain, minor seam). Complex (R250): larger or multiple issues (peeling vinyl or print, tear over 5cm, several stains, damaged logo). Full Refresh (R400): jersey-wide refresh (faded or peeling print across the kit, multiple damage types, name/number replacement).` +
      `\nconfidence: 0.0 to 1.0 — be honest; 0.9+ only when the damage is unmistakable, 0.5-0.8 when the photo is moderately clear, below 0.5 when the photo is unclear or ambiguous.` +
      `\nSuggested price must be in cents: Basic=15000, Complex=25000, Full Refresh=40000.`;

    const controller = new AbortController();
    // 90b vision can spike to ~8-10s under NVIDIA shared load; 12s keeps
    // margin while staying under Vercel's 10s default for streaming-less routes.
    const timer = setTimeout(() => controller.abort(), 12000);

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
  } catch (e) {
    console.error("analyze route error:", e);
    return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
  }
}