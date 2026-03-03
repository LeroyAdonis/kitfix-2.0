import { requireRole } from "@/lib/auth-utils";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Separator } from "@/components/ui/separator";

/** Admin pages require auth + live DB data — never statically prerender. */
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["admin"]);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b px-4 md:px-6">
          {/* Spacer for mobile hamburger */}
          <div className="w-8 md:w-0" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {session.user.name}
            </span>
            <NotificationBell />
          </div>
        </header>
        <Separator />

        <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
