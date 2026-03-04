/**
 * Inngest function definitions for KitFix 2.0.
 *
 * Each exported function is registered in the serve handler at
 * `app/api/inngest/route.ts`.
 */

import { logger } from "@/lib/logger";
import { inngest } from "./client";

// ---------------------------------------------------------------------------
// ai/damage.analyze — track the lifecycle of an AI damage analysis
// ---------------------------------------------------------------------------

/**
 * Tracks the lifecycle of an AI damage analysis request.
 *
 * The actual AI inference is handled by the calling API route; this
 * function provides structured logging, duration tracking, and
 * automatic retry semantics via Inngest steps.
 */
export const trackDamageAnalysis = inngest.createFunction(
  { id: "track-damage-analysis" },
  { event: "ai/damage.analyze" },
  async ({ event, step }) => {
    const {
      damageType,
      photoCount,
      userId,
      repairId,
      status,
      durationMs,
      error: errorMessage,
    } = event.data;

    logger.info("AI damage analysis event received", {
      userId,
      repairId,
      damageType,
      photoCount,
      status,
    });

    // ------------------------------------------------------------------
    // Step 1 — Log analysis lifecycle
    // ------------------------------------------------------------------
    const result = await step.run("log-analysis-lifecycle", () => {
      if (status === "error") {
        logger.error("AI damage analysis failed", {
          userId,
          repairId,
          damageType,
          photoCount,
          durationMs,
          error: errorMessage,
        });

        return {
          damageType,
          photoCount,
          status: "failed" as const,
          durationMs,
          error: errorMessage,
        };
      }

      logger.info("AI damage analysis completed", {
        userId,
        repairId,
        damageType,
        photoCount,
        durationMs,
        severity: event.data.severity,
        repairability: event.data.repairability,
      });

      return {
        damageType,
        photoCount,
        status: "completed" as const,
        durationMs,
        severity: event.data.severity,
        repairability: event.data.repairability,
      };
    });

    return result;
  },
);

// ---------------------------------------------------------------------------
// Export array for the serve handler
// ---------------------------------------------------------------------------

/** All Inngest functions — import this in the serve route. */
export const inngestFunctions = [trackDamageAnalysis];
