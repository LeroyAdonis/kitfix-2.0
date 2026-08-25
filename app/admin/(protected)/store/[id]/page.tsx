"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = useQuery(api.products.get, {
    id: id as Id<"products">,
  });

  if (product === undefined) {
    return (
      <div className="text-[var(--color-thread-dim)] font-mono text-xs uppercase tracking-wider py-8">
        Loading...
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="text-[var(--color-thread-dim)] font-mono text-xs uppercase tracking-wider py-8">
        Product not found
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-xl text-[var(--color-thread)] uppercase tracking-wide mb-6">
        Edit Product
      </h1>
      <ProductForm
        mode="edit"
        initialData={{
          _id: product._id,
          name: product.name,
          description: product.description,
          slug: product.slug,
          category: product.category,
          basePrice: product.basePrice,
          imageUrl: product.imageUrl,
          variants: product.variants.map((v) => ({
            _id: v._id,
            size: v.size,
            stock: v.stock,
            priceModifier: v.priceModifier,
          })),
          personalizationOptions: product.personalizationOptions.map((o) => ({
            _id: o._id,
            label: o.label,
            type: o.type,
            required: o.required,
            maxLength: o.maxLength,
            options: o.options,
          })),
        }}
      />
    </div>
  );
}
