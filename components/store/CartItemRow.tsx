"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { updateCartItem, removeFromCart } from "@/actions/cart";

interface CartItemRowProps {
  item: {
    id: string;
    productName: string;
    variantSize: string;
    unitPrice: number;
    quantity: number;
    personalization: Record<string, string> | null;
  };
  onUpdate: () => void;
}

export function CartItemRow({ item, onUpdate }: CartItemRowProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const lineTotal = item.unitPrice * item.quantity;

  const handleQuantityChange = async (newQty: number) => {
    if (newQty === item.quantity) return;
    setIsUpdating(true);
    await updateCartItem(item.id, newQty);
    setIsUpdating(false);
    onUpdate();
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    await removeFromCart(item.id);
    setIsRemoving(false);
    onUpdate();
  };

  const persText = item.personalization
    ? Object.entries(item.personalization)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ")
    : null;

  return (
    <div className="flex items-start gap-4 py-4">
      <div className="min-w-0 flex-1">
        <h4 className="font-medium">{item.productName}</h4>
        <p className="text-sm text-muted-foreground">Size: {item.variantSize}</p>
        {persText && (
          <p className="text-xs text-muted-foreground">{persText}</p>
        )}
        <p className="mt-1 text-sm">{formatCurrency(item.unitPrice)} each</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={item.quantity <= 1}
                onClick={() => handleQuantityChange(item.quantity - 1)}
              >
                -
              </Button>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (val > 0) handleQuantityChange(val);
                }}
                className="h-8 w-14 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                min={1}
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(item.quantity + 1)}
              >
                +
              </Button>
            </>
          )}
        </div>
        <div className="min-w-[5rem] text-right">
          <p className="font-medium">{formatCurrency(lineTotal)}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={handleRemove}
          disabled={isRemoving}
        >
          {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
