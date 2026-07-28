import { redirect } from "next/navigation";
import { checkAdmin } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) redirect("/admin/login");
  return <>{children}</>;
}
