import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <main className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          KitFix
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Professional jersey repair service. Submit your repair request, track
          progress, and get your kit back in top shape.
        </p>
        <div className="flex gap-4">
          <Link
            href="/sign-up"
            className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started
          </Link>
          <Link
            href="/sign-in"
            className="rounded-md border border-input bg-background px-6 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}

