import Link from "next/link";
import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { orders, user } from "@/lib/db/schema";

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

const BADGE_CLASS: Record<string, string> = {
  pending: "badge-outline",
  paid: "badge-gold",
  shipped: "badge-outline",
  delivered: "badge-success",
  cancelled: "badge-error",
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
      <h1 className="text-2xl font-bold tracking-tight text-text-primary">Orders</h1>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            !isValidStatus
              ? "bg-primary text-primary-foreground"
              : "bg-surface text-text-secondary hover:bg-surface-hover"
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
                : "bg-surface text-text-secondary hover:bg-surface-hover"
            }`}
          >
            {s}
            <span className="ml-1 text-[10px] text-text-tertiary">
              {BADGE_CLASS[s] === "badge-outline" ? "○" : "●"}
            </span>
          </Link>
        ))}
      </div>

      <div className="rounded-md border border-border">
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
                  <span className={`badge ${BADGE_CLASS[o.status] ?? "badge-outline"}`}>
                    {o.status}
                  </span>
                </TableCell>
                <TableCell>
                  {formatDateSAST(new Date(o.createdAt))}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="text-sm font-medium text-text-link hover:underline"
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {result.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="empty-state py-8">
                    <p className="empty-description">No orders found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
