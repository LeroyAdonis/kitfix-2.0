import Link from "next/link";
import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { orders, user } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDateSAST } from "@/lib/utils";

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"] as const;

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  paid: "default",
  shipped: "secondary",
  delivered: "default",
  cancelled: "destructive",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status;
  const isValidStatus = statusFilter && STATUSES.includes(statusFilter as typeof STATUSES[number]);

  const result = await db
    .select({
      id: orders.id,
      userId: orders.userId,
      status: orders.status,
      totalCents: orders.totalCents,
      shippingCents: orders.shippingCents,
      grandTotalCents: orders.grandTotalCents,
      shippingAddress: orders.shippingAddress,
      polarCheckoutId: orders.polarCheckoutId,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      customerName: user.name,
    })
    .from(orders)
    .innerJoin(user, eq(orders.userId, user.id))
    .where(isValidStatus ? eq(orders.status, statusFilter) : undefined)
    .orderBy(desc(orders.createdAt));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Orders</h1>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            !isValidStatus
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
              statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s}
            <Badge variant="outline" className="ml-1 text-[10px]">
              {STATUS_VARIANT[s] === "outline" ? "○" : "●"}
            </Badge>
          </Link>
        ))}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs">
                  {o.id.slice(0, 8)}…
                </TableCell>
                <TableCell className="font-medium">{o.customerName}</TableCell>
                <TableCell>{formatCurrency(o.grandTotalCents)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[o.status] ?? "outline"}>
                    {o.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatDateSAST(new Date(o.createdAt))}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {result.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
