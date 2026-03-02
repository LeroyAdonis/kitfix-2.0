import Link from "next/link";
import { Scissors } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-muted/30"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--background)_100%)]" />
      </div>

      {/* Logo / Branding */}
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-foreground transition-opacity hover:opacity-70"
        aria-label="Back to KitFix home"
      >
        <Scissors className="size-5" />
        <span className="text-lg font-semibold tracking-tight">KitFix</span>
      </Link>

      {/* Auth card */}
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        {children}
      </div>

      {/* Back to home */}
      <Link
        href="/"
        className="mt-6 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        &larr; Back to home
      </Link>
    </div>
  );
}
