import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

// Vision calls routinely spike past the default 10s function limit (Vercel
// Hobby default). Without this, production aborts before NIM can answer.
export const maxDuration = 60;

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
  const started = Date.now();
  let photoStorageIds: string[];
  let customerDescription = "";
  try {
    const body = await req.json();
    customerDescription =
      typeof body.description === "string" ? body.description.trim() : "";
    if (!Array.isArray(body.photoStorageIds) || body.photoStorageIds.length === 0) {
      logger.error(`[analyze] failed stage=validate-body status=- latency=${Date.now() - started}ms error=photoStorageIds missing or empty`);
      return NextResponse.json({ error: "analysis_failed" }, { status: 400 });
    }
    photoStorageIds = body.photoStorageIds.filter(
      (s: unknown): s is string => typeof s === "string" && s.length > 0,
    );
    if (photoStorageIds.length === 0) {
      logger.error(`[analyze] failed stage=validate-body status=- latency=${Date.now() - started}ms error=photoStorageIds all invalid`);
      return NextResponse.json({ error: "analysis_failed" }, { status: 400 });
    }
  } catch (e) {
    logger.error(`[analyze] failed stage=validate-body status=- latency=${Date.now() - started}ms error=${e instanceof Error ? e.message : String(e)}`);
    return NextResponse.json({ error: "analysis_failed" }, { status: 400 });
  }

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    logger.error(`[analyze] failed stage=config status=- latency=${Date.now() - started}ms error=NVIDIA_API_KEY not set`);
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
      logger.error(`[analyze] failed stage=resolve-photo status=${resolveRes.status} latency=${Date.now() - started}ms error=convex getPhotoUrl returned ${resolveRes.status}`);
      return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
    }
    const resolveData = await resolveRes.json();
    const storageUrl = resolveData?.value ?? resolveData?.result;
    if (typeof storageUrl !== "string") {
      logger.error(`[analyze] failed stage=resolve-photo status=- latency=${Date.now() - started}ms error=storageUrl not a string`);
      return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
    }

    const imageRes = await fetch(storageUrl, { cache: "no-store" });
    if (!imageRes.ok) {
      logger.error(`[analyze] failed stage=fetch-photo status=${imageRes.status} latency=${Date.now() - started}ms error=image fetch returned ${imageRes.status}`);
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
    // 90b vision routinely spikes past 10s under NVIDIA shared load; 25s gives
    // margin. Requires `export const maxDuration = 60` (above) so Vercel
    // doesn't kill the function before the abort fires.
    const timer = setTimeout(() => controller.abort(), 25000);

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
      logger.error(`[analyze] failed stage=nim status=${nimRes.status} latency=${Date.now() - started}ms error=NIM returned ${nimRes.status}`);
      return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
    }

    const nimData = await nimRes.json();
    const content = nimData?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      logger.error(`[analyze] failed stage=nim-parse status=- latency=${Date.now() - started}ms error=NIM response content not a string`);
      return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleanJson(content));
    } catch (e) {
      logger.error(`[analyze] failed stage=nim-parse status=- latency=${Date.now() - started}ms error=${e instanceof Error ? e.message : String(e)}`);
      return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
    }

    const analysis = validateAnalysis(parsed);
    if (!analysis) {
      logger.error(`[analyze] failed stage=validate-analysis status=- latency=${Date.now() - started}ms error=validateAnalysis returned null`);
      return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
    }

    logger.info(`[analyze] ok model=${MODEL} tier=${analysis.suggestedTier} confidence=${analysis.confidence} latency=${Date.now() - started}ms`);

    return NextResponse.json({ ...analysis, model: MODEL });
  } catch (e) {
    logger.error(`[analyze] failed stage=unhandled status=- latency=${Date.now() - started}ms error=${e instanceof Error ? e.message : String(e)}`);
    return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
  }
}