import { redirect } from "next/navigation";
import { checkAdmin } from "@/lib/admin-auth";
import { AdminDashboard } from "./admin-dashboard";

export default async function AdminPage() {
  const isAdmin = await checkAdmin();
  if (!isAdmin) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <header className="border-b border-[#1a1a2e] px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-[#00E859] flex items-center justify-center">
              <span className="text-black font-bold text-xs">KF</span>
            </div>
            <span className="font-bold text-white">KitFix Admin</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">Repair Dashboard</span>
            <form action="/api/admin/logout" method="POST">
              <button className="text-gray-400 hover:text-white transition-colors">Logout</button>
            </form>
          </div>
        </div>
      </header>

      <main className="p-6">
        <AdminDashboard />
      </main>
    </div>
  );
}
