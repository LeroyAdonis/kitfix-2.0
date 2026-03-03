import Link from "next/link";
import { and, eq, isNull, sql, inArray } from "drizzle-orm";
import { desc } from "drizzle-orm";

import { db } from "@/lib/db";
import { repairRequests, payments } from "@/lib/db/schema";
import { StatsCards } from "@/components/admin/stats-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateSAST } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import type { RepairStatus } from "@/types";

const ACTIVE_STATUSES: RepairStatus[] = [
  "submitted",
  "reviewed",
  "in_repair",
  "quality_check",
];

export default async function AdminDashboardPage() {
  const notDeleted = isNull(repairRequests.deletedAt);

  const [totalResult, activeResult, completedResult, revenueResult, recentRepairs] =
    await Promise.all([
      db
        .select({ value: sql<number>`count(*)` })
        .from(repairRequests)
        .where(notDeleted),
      db
        .select({ value: sql<number>`count(*)` })
        .from(repairRequests)
        .where(
          and(
            notDeleted,
            inArray(repairRequests.currentStatus, ACTIVE_STATUSES),
          ),
        ),
      db
        .select({ value: sql<number>`count(*)` })
        .from(repairRequests)
        .where(
          and(notDeleted, eq(repairRequests.currentStatus, "shipped")),
        ),
      db
        .select({ value: sql<number>`coalesce(sum(amount), 0)` })
        .from(payments)
        .where(eq(payments.status, "completed")),
      db.query.repairRequests.findMany({
        where: notDeleted,
        orderBy: [desc(repairRequests.createdAt)],
        limit: 5,
        with: { customer: true, technician: true },
      }),
    ]);

  const stats = {
    totalRequests: Number(totalResult[0]?.value ?? 0),
    activeRepairs: Number(activeResult[0]?.value ?? 0),
    completedRepairs: Number(completedResult[0]?.value ?? 0),
    totalRevenue: Number(revenueResult[0]?.value ?? 0),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      <StatsCards stats={stats} />

      {/* Recent requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Requests</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/requests">
              View all <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRepairs.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Link
                      href={`/admin/requests/${r.id}`}
                      className="font-mono text-xs hover:underline"
                    >
                      {r.id.slice(0, 8)}…
                    </Link>
                  </TableCell>
                  <TableCell>{r.customer?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {r.currentStatus.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDateSAST(new Date(r.createdAt))}
                  </TableCell>
                </TableRow>
              ))}
              {recentRepairs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-20 text-center">
                    No repair requests yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { href: "/admin/requests", label: "Manage Requests" },
          { href: "/admin/technicians", label: "Manage Technicians" },
          { href: "/admin/payments", label: "View Payments" },
        ].map(({ href, label }) => (
          <Button key={href} variant="outline" className="h-12" asChild>
            <Link href={href}>{label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
