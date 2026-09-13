import { inngest } from "./client";

/**
 * Alert on a KitFix AI (NVIDIA vision) failure.
 *
 * KitFix has no email helper, so this must not pull in a mail dependency:
 * it writes one structured line and, only when AI_ALERT_WEBHOOK_URL is set,
 * POSTs the same JSON to that webhook.
 */
export const aiFailureAlert = inngest.createFunction(
  {
    id: "ai-failure-alert",
    triggers: [{ event: "kitfix/ai.failed" }],
    onFailure: async ({ error }) => {
      // A failed alert must itself be visible.
      console.error("[inngest] aiFailureAlert failed:", error);
    },
  },
  async ({ event, step }) => {
    await step.run("report-ai-failure", async () => {
      const data = (event.data ?? {}) as {
        feature?: string;
        errorMessage?: string;
        model?: string;
        entityId?: string;
        at?: string;
      };

      const summary = {
        source: "kitfix",
        feature: data.feature ?? "unknown",
        model: data.model ?? "unknown",
        errorMessage: data.errorMessage ?? "unknown",
        entityId: data.entityId ?? null,
        at: data.at ?? new Date().toISOString(),
      };

      console.error("[ai-failure-alert]", JSON.stringify(summary));

      const webhook = process.env.AI_ALERT_WEBHOOK_URL;
      if (!webhook) return;

      try {
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(summary),
        });
      } catch (err) {
        // A dead webhook must not fail the step.
        console.warn("[ai-failure-alert] webhook delivery failed:", err);
      }
    });
  }
);
