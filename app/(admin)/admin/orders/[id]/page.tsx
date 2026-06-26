import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { orders, orderItems, user, payments } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDateSAST } from "@/lib/utils";
import { OrderStatusUpdater } from "./order-status-updater";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  paid: "default",
  shipped: "secondary",
  delivered: "default",
  cancelled: "destructive",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [order] = await db
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
      customerEmail: user.email,
    })
    .from(orders)
    .innerJoin(user, eq(orders.userId, user.id))
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) notFound();

  const itemsList = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, id));

  const paymentRecords = await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, id))
    .orderBy(desc(payments.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Order #{order.id.slice(0, 8)}
        </h1>
        <Badge variant={STATUS_VARIANT[order.status] ?? "outline"} className="text-sm capitalize">
          {order.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content — 2 cols */}
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemsList.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.productId}</TableCell>
                      <TableCell>{item.variantId}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.unitPriceCents)}</TableCell>
                      <TableCell>
                        {formatCurrency(item.unitPriceCents * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 space-y-1 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.totalCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatCurrency(order.shippingCents)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(order.grandTotalCents)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentRecords.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payments recorded.</p>
              ) : (
                <div className="space-y-2">
                  {paymentRecords.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-md border p-3 text-sm"
                    >
                      <div>
                        <span className="font-medium">
                          {formatCurrency(p.amount)}
                        </span>
                        <span className="ml-2 text-muted-foreground">
                          ({p.currency})
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={p.status === "completed" ? "default" : "outline"}>
                          {p.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDateSAST(new Date(p.createdAt))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar — 1 col */}
        <div className="space-y-6">
          {/* Status updater */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusUpdater
                orderId={order.id}
                currentStatus={order.status}
              />
            </CardContent>
          </Card>

          {/* Customer info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{order.customerName}</p>
              <p className="text-muted-foreground">{order.customerEmail}</p>
            </CardContent>
          </Card>

          {/* Shipping address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              {order.shippingAddress ? (
                <div className="space-y-1 text-sm">
                  {(typeof order.shippingAddress === "object" &&
                    order.shippingAddress !== null &&
                    !Array.isArray(order.shippingAddress)
                  ) ? (
                    Object.entries(order.shippingAddress as Record<string, unknown>).map(
                      ([key, value]) => (
                        <p key={key}>
                          <span className="text-muted-foreground capitalize">{key}: </span>
                          {String(value)}
                        </p>
                      ),
                    )
                  ) : (
                    <p className="text-muted-foreground">
                      {JSON.stringify(order.shippingAddress)}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not provided</p>
              )}
            </CardContent>
          </Card>

          {/* Polar checkout link */}
          {order.polarCheckoutId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Checkout</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Polar Checkout ID:{" "}
                  <span className="font-mono text-xs">{order.polarCheckoutId}</span>
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
