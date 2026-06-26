import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Package } from "lucide-react";

import { getSession } from "@/lib/auth-utils";
import { getOrders } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDateSAST } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const result = await getOrders();

  if (!result.success) {
    return (
      <EmptyState
        icon={<Package className="h-12 w-12" />}
        title="Something went wrong"
        description={result.error}
      />
    );
  }

  const orders = result.data;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-12 w-12" />}
        title="No orders yet"
        description="You haven't placed any orders yet."
        action={
          <Button asChild>
            <Link href="/shop">Browse Products</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="mt-1 text-muted-foreground">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <Card className="transition-colors hover:bg-accent/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      Order #{order.id.slice(0, 8)}
                    </CardTitle>
                    <CardDescription>
                      {formatDateSAST(new Date(order.createdAt))}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        order.status === "paid"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {order.status === "paid" ? "Paid" : order.status}
                    </span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(order.grandTotalCents)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  {order.items.length > 0 && (
                    <> &mdash; {order.items.map((i) => i.productName || "Product").join(", ")}</>
                  )}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
