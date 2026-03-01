import { eq, sql, desc } from "drizzle-orm";

import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDateSAST } from "@/lib/utils";
import type { PaymentStatus } from "@/types";

const STATUS_VARIANT: Record<PaymentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  completed: "default",
  failed: "destructive",
  refunded: "secondary",
};

export default async function AdminPaymentsPage() {
  const [allPayments, aggregates] = await Promise.all([
    db.query.payments.findMany({
      orderBy: [desc(payments.createdAt)],
      with: { customer: true, repairRequest: true },
    }),
    db
      .select({
        status: payments.status,
        total: sql<number>`coalesce(sum(${payments.amount}), 0)`,
        count: sql<number>`count(*)`,
      })
      .from(payments)
      .groupBy(payments.status),
  ]);

  const summaryMap = new Map(
    aggregates.map((a) => [a.status, { total: Number(a.total), count: Number(a.count) }]),
  );

  const statuses: PaymentStatus[] = ["completed", "pending", "failed", "refunded"];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Payments</h1>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statuses.map((s) => {
          const data = summaryMap.get(s) ?? { total: 0, count: 0 };
          return (
            <Card key={s}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm capitalize text-muted-foreground">
                  {s}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(data.total)}</p>
                <p className="text-xs text-muted-foreground">
                  {data.count} payment{data.count !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Repair ID</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allPayments.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  {formatCurrency(p.amount)}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[p.status as PaymentStatus]}>
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell>{p.customer?.name ?? "—"}</TableCell>
                <TableCell className="font-mono text-xs">
                  {p.repairRequestId.slice(0, 8)}…
                </TableCell>
                <TableCell>
                  {formatDateSAST(new Date(p.createdAt))}
                </TableCell>
              </TableRow>
            ))}
            {allPayments.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No payments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
