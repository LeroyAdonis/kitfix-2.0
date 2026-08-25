import Link from "next/link";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-pitch-deep)]">
      <header className="border-b border-[var(--color-pitch-line)]/40 px-4 py-3 md:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--color-stitch)] flex items-center justify-center">
              <span className="text-[var(--color-ink)] font-display text-xs">KF</span>
            </div>
            <span className="font-display text-base text-[var(--color-thread)] uppercase tracking-wide">
              KitFix <span className="text-[var(--color-stitch)]">Admin</span>
            </span>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-[0.16em]">
            <Link
              href="/admin"
              className="text-[var(--color-thread-dim)] hover:text-[var(--color-stitch)] transition-colors"
            >
              Repair Board
            </Link>
            <span className="text-[var(--color-stitch)]">Store</span>
            <form action="/api/admin/logout" method="POST">
              <button className="text-[var(--color-thread-dim)] hover:text-[var(--color-stitch)] transition-colors">
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <div
        aria-hidden="true"
        className="h-[4px] w-full"
        style={{
          background:
            "repeating-linear-gradient(90deg, var(--color-stitch) 0 10px, transparent 10px 16px)",
        }}
      />

      <main className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-1 mb-6 border-b border-[var(--color-pitch-line)]/40">
            <Link
              href="/admin/store"
              className="px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-stitch)] border-b-2 border-[var(--color-stitch)] -mb-px"
            >
              Products
            </Link>
            <span className="px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-thread-dim)] opacity-50 cursor-not-allowed">
              Orders
              <span className="ml-2 text-[10px] text-[var(--color-thread-dim)]">
                Coming soon
              </span>
            </span>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
