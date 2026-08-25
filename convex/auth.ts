import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth/minimal";
import authConfig from "./auth.config";

const siteUrl =
  process.env.SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://mykitfix.co.za";

// Trusted origins for Better Auth origin validation (fixes INVALID_ORIGIN on
// the custom domain). Production is served from mykitfix.co.za (primary) and
// the Vercel alias (previews/tests); local dev uses localhost.
const trustedOrigins = [
  "https://mykitfix.co.za",
  "https://www.mykitfix.co.za",
  "https://kitfix-2-0.vercel.app",
  "http://localhost:3000",
];

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: siteUrl,
    trustedOrigins,
    database: authComponent.adapter(ctx),
    // Simple, non-verified email/password for MVP
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      // The Convex plugin is required for Convex compatibility
      convex({ authConfig }),
    ],
  });
};

// Example function for getting the current user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});
