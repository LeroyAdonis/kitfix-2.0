"use client";

import { ComponentProps, ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({
  children,
  initialToken,
}: {
  children: ReactNode;
  initialToken?: string | null;
}) {
  return (
    <ConvexBetterAuthProvider
      client={convex}
      authClient={authClient as unknown as ComponentProps<typeof ConvexBetterAuthProvider>["authClient"]}
      initialToken={initialToken}
    >
      {children}
    </ConvexBetterAuthProvider>
  );
}
