import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { aiFailureAlert } from "@/lib/inngest/functions";

// Inngest Cloud calls this endpoint to discover and run our functions.
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [aiFailureAlert],
});
