"use client";

import Link from "next/link";
import { Wrench, Scissors } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="mx-auto max-w-sm text-center">
        {/* Logo */}
        <div className="mb-10 flex items-center justify-center gap-2 text-muted-foreground">
          <Scissors className="size-4" aria-hidden="true" />
          <span className="text-sm font-semibold tracking-tight text-foreground">
            KitFix
          </span>
        </div>

        {/* Icon */}
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-muted">
          <Wrench className="size-6 text-muted-foreground" aria-hidden="true" />
        </div>

        <h1 className="text-xl font-bold tracking-tight">
          Something Went Wrong
        </h1>

        <div role="alert" className="mt-3">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-[11px] text-muted-foreground/50">
              Ref: {error.digest}
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-col items-center gap-2.5 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
            aria-label="Retry loading this page"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex h-10 w-full items-center justify-center rounded-lg border bg-background px-5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground sm:w-auto"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
