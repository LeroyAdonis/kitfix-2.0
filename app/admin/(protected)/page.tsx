import { redirect } from "next/navigation";
import { checkAdmin } from "@/lib/admin-auth";
import { AdminDashboard } from "../admin-dashboard";

export default async function AdminPage() {
  const isAdmin = await checkAdmin();
  if (!isAdmin) redirect("/admin/login");

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
            <span className="hidden sm:inline text-[var(--color-thread-dim)]">Repair Board</span>
            <form action="/api/admin/logout" method="POST">
              <button className="text-[var(--color-thread-dim)] hover:text-[var(--color-stitch)] transition-colors">
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6">
        <AdminDashboard />
      </main>
    </div>
  );
}
