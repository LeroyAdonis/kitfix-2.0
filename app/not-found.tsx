import Link from "next/link";
import { Scissors, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="mx-auto max-w-sm text-center">
        {/* Logo */}
        <div className="mb-10 flex items-center justify-center gap-2 text-muted-foreground">
          <Scissors className="size-4" aria-hidden="true" />
          <span className="text-sm font-semibold tracking-tight text-foreground">
            KitFix
          </span>
        </div>

        {/* Large 404 */}
        <p className="font-mono text-6xl font-bold tracking-tighter text-muted-foreground/25 sm:text-7xl">
          404
        </p>

        <h1 className="mt-4 text-xl font-bold tracking-tight">
          Page Not Found
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
