import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Package } from "lucide-react";

import { getSession } from "@/lib/auth-utils";
import { getOrders } from "@/actions/orders";
import { formatCurrency, formatDateSAST } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const result = await getOrders();

  if (!result.success) {
    return (
      <div className="empty-state">
        <Package className="empty-icon" />
        <h2 className="empty-heading">Something went wrong</h2>
        <p className="empty-description">{result.error}</p>
      </div>
    );
  }

  const orders = result.data;

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <ShoppingBag className="empty-icon" />
        <h2 className="empty-heading">No orders yet</h2>
        <p className="empty-description">You haven&apos;t placed any orders yet.</p>
        <Link href="/shop" className="btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-display">My Orders</h1>
        <p className="mt-1 text-text-secondary">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="card-base block p-4 sm:p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Order #{order.id.slice(0, 8)}
                </p>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {formatDateSAST(new Date(order.createdAt))}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={
                    order.status === "paid"
                      ? "badge badge-gold"
                      : order.status === "shipped"
                        ? "badge badge-success"
                        : "badge badge-outline"
                  }
                >
                  {order.status === "paid" ? "Paid" : order.status}
                </span>
                <span className="text-sm font-semibold text-text-primary">
                  {formatCurrency(order.grandTotalCents)}
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs text-text-secondary">
              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              {order.items.length > 0 && (
                <> &mdash; {order.items.map((i) => i.productName || "Product").join(", ")}</>
              )}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
