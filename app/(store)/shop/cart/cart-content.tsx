"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CartItemRow } from "@/components/store/CartItemRow";
import { formatCurrency } from "@/lib/utils";

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  variantSize: string;
  unitPrice: number;
  quantity: number;
  personalization: Record<string, string> | null;
}

interface CartContentProps {
  items: CartItem[];
  itemTotal: number;
}

export function CartContent({ items, itemTotal }: CartContentProps) {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
        <p className="mt-1 text-muted-foreground">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="divide-y rounded-lg border">
        {items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            onUpdate={handleRefresh}
          />
        ))}
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <div>
          <p className="text-lg font-semibold">Total: {formatCurrency(itemTotal)}</p>
          <p className="text-sm text-muted-foreground">Shipping calculated at checkout</p>
        </div>
        <Button size="lg" asChild>
          <a href="/checkout">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Proceed to Checkout
          </a>
        </Button>
      </div>
    </div>
  );
}
