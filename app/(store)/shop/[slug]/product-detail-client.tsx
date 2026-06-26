"use client";

import { useState } from "react";

import { VariantPicker } from "@/components/store/VariantPicker";
import { PersonalizationFields } from "@/components/store/PersonalizationFields";
import { AddToCartButton } from "@/components/store/AddToCartButton";
import { formatCurrency } from "@/lib/utils";

interface Variant {
  id: string;
  size: string;
  stock: number;
  priceModifier: number;
}

interface PersonalizationOption {
  id: string;
  fieldName: string;
  fieldType: string;
  isRequired: boolean;
  maxLength: number | null;
  options: string[] | null;
}

interface ProductDetailClientProps {
  productId: string;
  variants: Variant[];
  personalizationOptions: PersonalizationOption[];
  basePrice: number;
}

export function ProductDetailClient({
  productId,
  variants,
  personalizationOptions,
  basePrice,
}: ProductDetailClientProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [personalization, setPersonalization] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const totalPrice = basePrice + (selectedVariant?.priceModifier ?? 0);

  const handlePersonalizationChange = (fieldName: string, value: string) => {
    setPersonalization((prev) => ({ ...prev, [fieldName]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <VariantPicker
        variants={variants}
        selectedVariantId={selectedVariantId}
        onSelect={setSelectedVariantId}
      />

      {selectedVariant && (
        <p className="text-lg font-semibold">
          Total: {formatCurrency(totalPrice)}
          {selectedVariant.priceModifier > 0 && (
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              (includes R {formatCurrency(selectedVariant.priceModifier)} size surcharge)
            </span>
          )}
        </p>
      )}

      <PersonalizationFields
        options={personalizationOptions}
        values={personalization}
        onChange={handlePersonalizationChange}
        errors={errors}
      />

      <AddToCartButton
        productId={productId}
        variantId={selectedVariantId}
        personalization={personalization}
      />
    </div>
  );
}
