"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="mt-1 text-muted-foreground">
          Review your order and complete payment
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <form action={handleSubmit} className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Method</CardTitle>
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
              <CardTitle>Shipping Address</CardTitle>
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
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Place Order &mdash; {formatCurrency(itemTotal + shippingCost)}
              </>
            )}
          </Button>
        </form>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>{items.length} item{items.length !== 1 ? "s" : ""}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-muted-foreground">
                      Size {item.variantSize} &times; {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(itemTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping ({shippingMode})</span>
                <span>{shippingCost > 0 ? formatCurrency(shippingCost) : "Free"}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
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
