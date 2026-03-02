import { requireAuth } from "@/lib/auth-utils";
import { getRepairsByCustomer } from "@/lib/db/queries/repairs";
import { AnimatedDashboard } from "@/components/customer/animated-dashboard";

export default async function CustomerDashboardPage() {
  const session = await requireAuth();
  const repairs = await getRepairsByCustomer(session.user.id, 1, 100);

  const activeRepairs = repairs.filter(
    (r) => r.currentStatus !== "shipped",
  );
  const completedRepairs = repairs.filter(
    (r) => r.currentStatus === "shipped",
  );
  const recentRepairs = repairs.slice(0, 5);

  return (
    <AnimatedDashboard
      userName={session.user.name}
      totalRepairs={repairs.length}
      activeRepairs={activeRepairs.length}
      completedRepairs={completedRepairs.length}
      recentRepairs={recentRepairs}
    />
  );
}
