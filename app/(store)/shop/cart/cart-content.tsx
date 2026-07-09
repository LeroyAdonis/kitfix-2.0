"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";

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
      {/* Editorial header */}
      <div className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-green-400/40" />
          <p className="text-[10px] font-semibold tracking-[0.3em] text-green-400 uppercase">Cart</p>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-[-0.02em] text-text-primary sm:text-4xl">Shopping Cart</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="divide-y divide-white/[0.04] rounded-xl border border-white/[0.04] bg-surface overflow-hidden">
        {items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            onUpdate={handleRefresh}
          />
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.04] pt-6">
        <div>
          <p className="font-display text-lg font-bold text-text-primary">Total: {formatCurrency(itemTotal)}</p>
          <p className="text-xs text-text-tertiary mt-1">Shipping calculated at checkout</p>
        </div>
        <a
          href="/checkout"
          className="inline-flex items-center gap-2 rounded-lg border border-green-400/20 bg-green-400/10 px-6 py-3 text-sm font-semibold text-green-400 transition-all duration-300 hover:bg-green-400/20"
        >
          <ShoppingCart className="h-4 w-4" />
          Proceed to Checkout
        </a>
      </div>
    </div>
  );
}
