import { Inngest } from "inngest";

/**
 * KitFix Inngest client.
 *
 * Reads INNGEST_EVENT_KEY / INNGEST_SIGNING_KEY from the environment.
 * Local dev can set INNGEST_DEV=1 to target the local dev server instead of
 * Inngest Cloud.
 */
export const inngest = new Inngest({ id: "kitfix" });
