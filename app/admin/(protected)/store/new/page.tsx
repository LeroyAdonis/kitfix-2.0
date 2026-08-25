"use client";

import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-display text-xl text-[var(--color-thread)] uppercase tracking-wide mb-6">
        New Product
      </h1>
      <ProductForm mode="create" />
    </div>
  );
}
