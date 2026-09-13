import { inngest } from "./client";

/**
 * Report an AI (NVIDIA vision) failure from /api/analyze.
 *
 * The analyze route already logs each failure stage, but nobody is watching
 * the logs — this sends the failure to Inngest so it is recorded, retried and
 * surfaced as an alert.
 *
 * Contract: MUST NEVER THROW and never make the caller fail. If the event key
 * is missing (local dev without .env) it warns and returns.
 */
export async function reportAiFailure(payload: {
  feature: string;
  errorMessage: string;
  model?: string;
  entityId?: string;
}) {
  try {
    if (!process.env.INNGEST_EVENT_KEY) {
      console.warn("[ai-failure] INNGEST_EVENT_KEY not set — skipping event send");
      return;
    }

    await inngest.send({
      name: "kitfix/ai.failed",
      data: { ...payload, at: new Date().toISOString() },
    });
  } catch (err) {
    console.error("[ai-failure] failed to send Inngest event:", err);
  }
}
