import { redirect } from "next/navigation";
import { logout } from "@/lib/admin-auth";

export async function POST() {
  await logout();
  redirect("/admin/login");
}
