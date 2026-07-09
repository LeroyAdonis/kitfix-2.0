import Link from "next/link";
import { AuthBrandPanel } from "./_components/auth-brand-panel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-bg-deep text-text-primary">
      {/* Left panel – brand showcase (hidden on mobile) */}
      <AuthBrandPanel />

      {/* Right panel – form area */}
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-bg-deep px-6 py-12 md:w-[55%]">
        {/* Dark base with subtle green radial glow */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
          style={{
            background: [
              "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(0,232,89,0.06) 0%, transparent 70%)",
              "radial-gradient(ellipse 50% 40% at 80% 80%, rgba(0,168,107,0.04) 0%, transparent 50%)",
            ].join(", "),
          }}
        />
        {/* Subtle noise texture */}
        <div
          className="pointer-events-none absolute inset-0 -z-20 opacity-[0.03]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Form content */}
        <div className="relative w-full max-w-md">{children}</div>

        {/* Back to home */}
        <Link
          href="/"
          className="relative mt-10 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}
