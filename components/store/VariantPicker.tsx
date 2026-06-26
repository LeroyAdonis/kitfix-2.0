"use client";

import { cn } from "@/lib/utils";

interface Variant {
  id: string;
  size: string;
  stock: number;
  priceModifier: number;
}

interface VariantPickerProps {
  variants: Variant[];
  selectedVariantId: string | null;
  onSelect: (variantId: string) => void;
}

export function VariantPicker({ variants, selectedVariantId, onSelect }: VariantPickerProps) {
  if (variants.length === 0) {
    return <p className="text-sm text-muted-foreground">No sizes available</p>;
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Size</label>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isOutOfStock = variant.stock <= 0;
          const isSelected = selectedVariantId === variant.id;

          return (
            <button
              key={variant.id}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onSelect(variant.id)}
              className={cn(
                "flex h-9 min-w-[2.5rem] items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-accent hover:text-accent-foreground",
                isOutOfStock && "cursor-not-allowed opacity-50 line-through",
              )}
            >
              {variant.size}
              {isOutOfStock && <span className="sr-only"> (out of stock)</span>}
            </button>
          );
        })}
      </div>
      {selectedVariantId && (
        <p className="text-xs text-muted-foreground">
          {variants.find((v) => v.id === selectedVariantId)?.stock ?? 0} in stock
        </p>
      )}
    </div>
  );
}
