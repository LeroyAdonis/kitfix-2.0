import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle, CreditCard } from "lucide-react";

import { getSession } from "@/lib/auth-utils";
import { getOrderById } from "@/actions/orders";
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
import { OrderPaymentButton } from "./order-payment-button";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const session = await getSession();
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
        <Button variant="ghost" size="icon" asChild>
          <Link href="/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
          <p className="mt-1 text-muted-foreground">
            #{order.id.slice(0, 8)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>
                Ordered on {formatDateSAST(new Date(order.createdAt))}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium">{item.productName || "Product"}</p>
                      <p className="text-muted-foreground">
                        Size {item.variantSize} &times; {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
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
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
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
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.totalCents)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatCurrency(order.shippingCents)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(order.grandTotalCents)}</span>
              </div>
            </CardContent>
          </Card>

          {isPending && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Required</CardTitle>
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
                <CardTitle>
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Payment Confirmed
                  </span>
                </CardTitle>
                <CardDescription>
                  Your order has been paid and is being processed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/orders">
                    <CreditCard className="mr-2 h-4 w-4" />
                    View All Orders
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
