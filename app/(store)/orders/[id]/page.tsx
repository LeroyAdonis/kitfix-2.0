import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle, CreditCard } from "lucide-react";

import { getOrderById } from "@/actions/orders";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatDateSAST } from "@/lib/utils";
import { OrderPaymentButton } from "./order-payment-button";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  const result = await getOrderById(id);

  if (!result.success) {
    notFound();
  }

  const order = result.data;
  const isPending = order.status === "pending";
  const isPaid = order.status === "paid";

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/orders"
          className="flex size-8 items-center justify-center rounded-full border border-white/[0.06] text-text-secondary transition-colors hover:text-green-400 hover:border-green-400/30"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-[-0.02em] text-text-primary">Order Details</h1>
          <p className="mt-1 text-sm text-text-secondary">
            #{order.id.slice(0, 8)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Items</CardTitle>
              <CardDescription>
                Ordered on {formatDateSAST(new Date(order.createdAt))}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-white/[0.04]">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium text-text-primary">{item.productName || "Product"}</p>
                      <p className="text-text-tertiary text-xs">
                        Size {item.variantSize} &times; {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-text-primary">
                      {formatCurrency(item.unitPriceCents * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Status</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-green-400/30 bg-green-400/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
                  {isPaid ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Paid
                    </>
                  ) : isPending ? (
                    "Pending"
                  ) : (
                    order.status
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Subtotal</span>
                <span className="text-text-primary">{formatCurrency(order.totalCents)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Shipping</span>
                <span className="text-text-primary">{formatCurrency(order.shippingCents)}</span>
              </div>
              <div className="h-px bg-white/[0.04]" />
              <div className="flex justify-between font-semibold text-text-primary">
                <span>Total</span>
                <span>{formatCurrency(order.grandTotalCents)}</span>
              </div>
            </CardContent>
          </Card>

          {isPending && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment Required</CardTitle>
                <CardDescription>
                  Complete your payment to process this order.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrderPaymentButton orderId={order.id} />
              </CardContent>
            </Card>
          )}

          {isPaid && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    Payment Confirmed
                  </span>
                </CardTitle>
                <CardDescription>
                  Your order has been paid and is being processed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href="/orders"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-green-400/20 bg-green-400/10 px-4 py-2 text-sm font-semibold text-green-400 transition-all duration-300 hover:bg-green-400/20"
                >
                  <CreditCard className="h-4 w-4" />
                  View All Orders
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
