/**
 * Inngest client for KitFix 2.0.
 *
 * Central client instance used to define functions and send events.
 * All Inngest functions and the serve handler import from here.
 */

import { EventSchemas, Inngest } from "inngest";

// ---------------------------------------------------------------------------
// Event type definitions
// ---------------------------------------------------------------------------

/**
 * Registry of all Inngest event types used across KitFix.
 *
 * Adding a new event? Define its shape here so the client, functions,
 * and `inngest.send()` calls all stay type-safe.
 */
type KitFixEvents = {
  "ai/damage.analyze": {
    data: {
      /** Category of damage (e.g. "tear", "stain", "badge-reattach"). */
      damageType: string;
      /** Number of photos attached to the analysis request. */
      photoCount: number;
      /** Authenticated user who triggered the analysis. */
      userId?: string;
      /** Repair request ID (absent if analysis is ad-hoc / unlinked). */
      repairId?: string;
      /** Free-text description of the damage. */
      damageDescription?: string;
      /** AI-determined severity (only present on success). */
      severity?: string;
      /** AI-determined affected area (only present on success). */
      affectedArea?: string;
      /** AI-determined repairability (only present on success). */
      repairability?: string;
      /** AI confidence score (only present on success). */
      confidence?: number;
      /** Wall-clock duration of the AI call in milliseconds. */
      durationMs?: number;
      /** Outcome: "success" or "error". */
      status?: string;
      /** Error message (only present on failure). */
      error?: string;
    };
  };
};

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export const inngest = new Inngest({
  id: "kitfix",
  schemas: new EventSchemas().fromRecord<KitFixEvents>(),
});
