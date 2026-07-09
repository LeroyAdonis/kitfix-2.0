"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { createOrderFromCart, initiateOrderCheckout } from "@/actions/orders";
import { ShippingStep } from "@/components/store/ShippingStep";
import type { EnrichedCartItem } from "@/actions/cart-enriched";
import type { ShippingMode } from "@/lib/courier/types";

interface CheckoutFormProps {
  items: EnrichedCartItem[];
  itemTotal: number;
}

export function CheckoutForm({ items, itemTotal }: CheckoutFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingMode, setShippingMode] = useState<ShippingMode>("L2L");
  const [lockerId, setLockerId] = useState("");
  const [shippingCost, setShippingCost] = useState(0);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const street = formData.get("street") as string;
    const city = formData.get("city") as string;
    const province = formData.get("province") as string;
    const postalCode = formData.get("postalCode") as string;

    const shippingData = {
      shippingMode,
      lockerId: shippingMode === "L2L" ? lockerId : undefined,
      shippingAddress: {
        street,
        city,
        province,
        postalCode,
        country: "South Africa",
      },
    };

    const orderResult = await createOrderFromCart(shippingData);
    if (!orderResult.success) {
      setError(orderResult.error);
      setPending(false);
      return;
    }

    const checkoutResult = await initiateOrderCheckout(orderResult.data.id);
    if (!checkoutResult.success) {
      setError(checkoutResult.error);
      setPending(false);
      return;
    }

    router.push(checkoutResult.data.checkoutUrl);
  }

  return (
    <div className="space-y-8">
      {/* Editorial header */}
      <div className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-green-400/40" />
          <p className="text-[10px] font-semibold tracking-[0.3em] text-green-400 uppercase">Payment</p>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-[-0.02em] text-text-primary sm:text-4xl">Checkout</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Review your order and complete payment
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <form action={handleSubmit} className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipping Method</CardTitle>
              <CardDescription>
                Choose how you want to receive your order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShippingStep
                shippingMode={shippingMode}
                onModeChange={setShippingMode}
                lockerId={lockerId}
                onLockerChange={setLockerId}
                shippingCost={shippingCost}
                onShippingCostChange={setShippingCost}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipping Address</CardTitle>
              <CardDescription>
                Where should we ship your order?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" required placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" required placeholder="+27 82 123 4567" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input id="street" name="street" required placeholder="123 Main Street" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" required placeholder="Cape Town" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Input id="province" name="province" placeholder="Western Cape" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input id="postalCode" name="postalCode" required placeholder="8001" />
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg border border-green-400/20 bg-green-400/10 px-6 py-3 text-sm font-semibold text-green-400 transition-all duration-300 hover:bg-green-400/20 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Place Order &mdash; {formatCurrency(itemTotal + shippingCost)}
              </>
            )}
          </button>
        </form>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
              <CardDescription>{items.length} item{items.length !== 1 ? "s" : ""}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">{item.productName}</p>
                    <p className="text-text-tertiary text-xs">
                      Size {item.variantSize} &times; {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium text-text-primary">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </p>
                </div>
              ))}
              <Separator className="bg-white/[0.04]" />
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Subtotal</span>
                <span className="text-text-primary">{formatCurrency(itemTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Shipping ({shippingMode})</span>
                <span className="text-text-primary">{shippingCost > 0 ? formatCurrency(shippingCost) : "Free"}</span>
              </div>
              <Separator className="bg-white/[0.04]" />
              <div className="flex justify-between font-semibold text-text-primary">
                <span>Total</span>
                <span>{formatCurrency(itemTotal + shippingCost)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
