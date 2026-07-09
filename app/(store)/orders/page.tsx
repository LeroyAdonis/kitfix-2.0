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
      {/* Editorial header */}
      <div className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-green-400/40" />
          <p className="text-[10px] font-semibold tracking-[0.3em] text-green-400 uppercase">Orders</p>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-[-0.02em] text-text-primary sm:text-4xl">My Orders</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="block rounded-xl border border-white/[0.04] bg-surface p-5 transition-all duration-300 hover:border-green-400/20 hover:-translate-y-0.5 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary group-hover:text-green-400 transition-colors duration-300">
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
                      ? "inline-flex items-center rounded-full border border-green-400/30 bg-green-400/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-green-400"
                      : order.status === "shipped"
                        ? "inline-flex items-center rounded-full border border-green-400/30 bg-green-400/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-green-400"
                        : "inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-text-tertiary"
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
