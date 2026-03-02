import Link from "next/link";
import { AuthBrandPanel } from "./_components/auth-brand-panel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel – brand showcase (hidden on mobile) */}
      <AuthBrandPanel />

      {/* Right panel – form area */}
      <div className="relative flex w-full flex-col items-center justify-center bg-background px-6 py-12 md:w-[55%]">
        {/* Form content */}
        <div className="w-full max-w-md">{children}</div>

        {/* Back to home */}
        <Link
          href="/"
          className="mt-10 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}
