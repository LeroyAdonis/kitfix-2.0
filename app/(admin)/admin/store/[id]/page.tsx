import { notFound } from "next/navigation";

import { getProductForEdit } from "@/actions/admin-store";
import { ProductForm } from "./product-form";

export default async function AdminProductFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (id === "new") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Add Product</h1>
        <ProductForm />
      </div>
    );
  }

  const result = await getProductForEdit(id);
  if (!result.success) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
      <ProductForm product={result.data} />
    </div>
  );
}
