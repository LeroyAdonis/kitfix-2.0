import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSession } from "@/lib/auth-utils";
import { inngest } from "@/lib/inngest/client";
import { logger } from "@/lib/logger";
import type { AIDamageAssessment } from "@/types/ai";

// ── Constants ────────────────────────────────────────────────────────────────

const AI_PROMPT = `Analyze this jersey repair photo. Identify:
1. Type of damage (tear, hole, stain, fading, logo damage, seam split)
2. Severity (minor, moderate, severe)
3. Affected area (front, back, sleeve, collar, hem)
4. Estimated repairability (easy, moderate, difficult)
Return as JSON with keys: damageType, severity, affectedArea, repairability.
Only return the JSON object, no markdown fences or extra text.`;

const GEMINI_MODEL = "gemini-2.0-flash";
const TIMEOUT_MS = 30_000;
const MAX_PHOTOS = 5;

export const maxDuration = 30;

// ── Helpers ──────────────────────────────────────────────────────────────────

function validateEnum<T extends string>(
  value: string,
  allowed: T[],
  fallback: T,
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/**
 * Parse the raw AI text into a validated damage assessment.
 * Strips markdown fences if the model includes them despite instructions.
 */
function parseAIResponse(
  raw: string,
): Omit<AIDamageAssessment, "confidence" | "rawResponse"> {
  const cleaned = raw
    .replace(/```(?:json)?\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();
  const parsed: unknown = JSON.parse(cleaned);

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("damageType" in parsed) ||
    !("severity" in parsed) ||
    !("affectedArea" in parsed) ||
    !("repairability" in parsed)
  ) {
    throw new Error("Invalid AI response structure");
  }

  const obj = parsed as Record<string, unknown>;
  return {
    damageType: String(obj.damageType),
    severity: validateEnum(
      String(obj.severity),
      ["minor", "moderate", "severe"],
      "moderate",
    ),
    affectedArea: String(obj.affectedArea),
    repairability: validateEnum(
      String(obj.repairability),
      ["easy", "moderate", "difficult"],
      "moderate",
    ),
  };
}

/**
 * Extract base64 data and MIME type from a data URL.
 * Expects format: `data:<mime>;base64,<data>`
 */
function parseDataUrl(dataUrl: string): { mimeType: string; data: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid data URL format");
  }
  return { mimeType: match[1], data: match[2] };
}

function shouldSendInngestEvents(): boolean {
  return !!(process.env.INNGEST_EVENT_KEY || process.env.INNGEST_SIGNING_KEY);
}

// ── Request body schema ──────────────────────────────────────────────────────

interface AnalyzeRequestBody {
  photoDataUrls: string[];
  damageType: string;
  damageDescription: string;
}

function validateRequestBody(body: unknown): AnalyzeRequestBody {
  if (typeof body !== "object" || body === null) {
    throw new Error("Request body must be a JSON object");
  }

  const obj = body as Record<string, unknown>;

  if (
    !Array.isArray(obj.photoDataUrls) ||
    obj.photoDataUrls.length === 0 ||
    !obj.photoDataUrls.every((url: unknown) => typeof url === "string")
  ) {
    throw new Error(
      "photoDataUrls must be a non-empty array of base64 data URL strings",
    );
  }

  if (obj.photoDataUrls.length > MAX_PHOTOS) {
    throw new Error(`Maximum ${MAX_PHOTOS} photos allowed per analysis`);
  }

  // Reject individual images larger than ~8MB base64 (≈6MB original)
  const MAX_BASE64_LENGTH = 8 * 1024 * 1024;
  for (const url of obj.photoDataUrls as string[]) {
    if (url.length > MAX_BASE64_LENGTH) {
      throw new Error("One or more photos exceed the maximum size of 6MB");
    }
  }

  if (typeof obj.damageType !== "string" || !obj.damageType.trim()) {
    throw new Error("damageType is required");
  }

  if (
    typeof obj.damageDescription !== "string" ||
    !obj.damageDescription.trim()
  ) {
    throw new Error("damageDescription is required");
  }

  return {
    photoDataUrls: obj.photoDataUrls as string[],
    damageType: obj.damageType,
    damageDescription: obj.damageDescription,
  };
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  // ── Check API key availability ────────────────────────────────────────
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    logger.warn("AI analysis requested but GOOGLE_GENERATIVE_AI_API_KEY is not set");
    return NextResponse.json(
      {
        error:
          "AI analysis is not configured. Please set the GOOGLE_GENERATIVE_AI_API_KEY environment variable.",
      },
      { status: 503 },
    );
  }

  // ── Parse & validate request body ─────────────────────────────────────
  let body: AnalyzeRequestBody;
  try {
    const raw: unknown = await request.json();
    body = validateRequestBody(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request body";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { photoDataUrls, damageType, damageDescription } = body;

  logger.info("Starting AI damage analysis", {
    userId: session.user.id,
    photoCount: photoDataUrls.length,
    damageType,
  });

  // ── Call Gemini ───────────────────────────────────────────────────────
  const startTime = Date.now();
  let rawResponse = "";

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    // Build content parts: prompt text + inline image data
    const contextPrompt = `${AI_PROMPT}\n\nAdditional context — reported damage type: "${damageType}", description: "${damageDescription}"`;

    const imageParts = photoDataUrls.map((dataUrl) => {
      const { mimeType, data } = parseDataUrl(dataUrl);
      return { inlineData: { mimeType, data } };
    });

    // Abort after TIMEOUT_MS
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const result = await model.generateContent(
        [contextPrompt, ...imageParts],
        { signal: controller.signal },
      );
      rawResponse = result.response.text();
    } finally {
      clearTimeout(timeout);
    }

    // ── Parse & validate AI output ────────────────────────────────────
    const parsed = parseAIResponse(rawResponse);
    const assessment: AIDamageAssessment = {
      ...parsed,
      confidence: 0.75,
      rawResponse,
    };

    const durationMs = Date.now() - startTime;
    logger.info("AI damage analysis completed", {
      userId: session.user.id,
      durationMs,
      severity: assessment.severity,
      repairability: assessment.repairability,
    });

    // ── Fire-and-forget Inngest event ────────────────────────────────
    if (shouldSendInngestEvents()) {
      void inngest.send({
        name: "ai/damage.analyze",
        data: {
          userId: session.user.id,
          damageType: assessment.damageType,
          damageDescription,
          severity: assessment.severity,
          affectedArea: assessment.affectedArea,
          repairability: assessment.repairability,
          confidence: assessment.confidence,
          photoCount: photoDataUrls.length,
          durationMs,
          status: "success",
        },
      }).catch((inngestErr: unknown) => {
        logger.warn("Failed to send Inngest event", {
          error:
            inngestErr instanceof Error
              ? inngestErr.message
              : "Unknown Inngest error",
        });
      });
    }

    return NextResponse.json({ data: assessment });
  } catch (err) {
    const durationMs = Date.now() - startTime;
    const isAbort =
      err instanceof Error && err.name === "AbortError";
    const message = isAbort
      ? "AI analysis timed out after 30 seconds"
      : err instanceof Error
        ? err.message
        : "AI analysis failed unexpectedly";

    logger.error("AI damage analysis failed", {
      userId: session.user.id,
      durationMs,
      error: message,
    });

    // ── Fire-and-forget Inngest event for failure ────────────────────
    if (shouldSendInngestEvents()) {
      void inngest.send({
        name: "ai/damage.analyze",
        data: {
          userId: session.user.id,
          damageType,
          damageDescription,
          photoCount: photoDataUrls.length,
          durationMs,
          status: "error",
          error: message,
        },
      }).catch((inngestErr: unknown) => {
        logger.warn("Failed to send Inngest event (failure path)", {
          error:
            inngestErr instanceof Error
              ? inngestErr.message
              : "Unknown Inngest error",
        });
      });
    }

    return NextResponse.json(
      { error: message },
      { status: isAbort ? 504 : 500 },
    );
  }
}
