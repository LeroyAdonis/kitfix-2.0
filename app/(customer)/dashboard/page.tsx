import Link from "next/link";
import { requireAuth } from "@/lib/auth-utils";
import { getRepairsByCustomer } from "@/lib/db/queries/repairs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RepairCard } from "@/components/repair/repair-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Wrench, Package, CheckCircle2, PlusCircle } from "lucide-react";

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {session.user.name}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your jersey repairs.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Repairs</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repairs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRepairs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedRepairs.length}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Repairs</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/repairs">View All</Link>
          </Button>
        </div>

        {recentRepairs.length > 0 ? (
          <div className="space-y-3">
            {recentRepairs.map((repair) => (
              <RepairCard key={repair.id} repair={repair} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Wrench className="h-10 w-10" />}
            title="No repairs yet"
            description="Submit your first jersey repair request to get started."
            action={
              <Button asChild>
                <Link href="/repairs/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Repair Request
                </Link>
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
