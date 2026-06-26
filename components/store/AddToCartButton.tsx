"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { addToCart } from "@/actions/cart";

interface AddToCartButtonProps {
  productId: string;
  variantId: string | null;
  personalization: Record<string, string>;
  disabled?: boolean;
}

export function AddToCartButton({ productId, variantId, personalization, disabled }: AddToCartButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleClick = async () => {
    if (!variantId) return;

    setIsPending(true);
    setError(null);

    const result = await addToCart({
      productId,
      variantId,
      quantity: 1,
      personalization,
    });

    setIsPending(false);

    if (!result.success) {
      if (result.error === "You must be signed in.") {
        router.push("/sign-in");
        return;
      }
      setError(result.error);
      return;
    }

    router.refresh();
  };

  const isDisabled = disabled || isPending || !variantId;

  return (
    <div className="space-y-2">
      <Button
        onClick={handleClick}
        disabled={isDisabled}
        className="w-full"
        size="lg"
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ShoppingCart className="mr-2 h-4 w-4" />
        )}
        {!variantId ? "Select a size" : isPending ? "Adding..." : "Add to Cart"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
