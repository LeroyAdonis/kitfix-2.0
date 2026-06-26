"use client";

import { useRouter } from "next/navigation";
import { Pencil, Trash2, EyeOff, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  deleteProduct,
} from "@/actions/admin-store";
import type { Product } from "@/types";

export function ProductActions({ product }: { product: Product }) {
  const router = useRouter();

  async function handleToggleActive() {
    const result = await deleteProduct(product.id);
    if (result.success) router.refresh();
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        asChild
      >
        <a href={`/admin/store/${product.id}`}>
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </a>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggleActive}
      >
        {product.isActive ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
        <span className="sr-only">
          {product.isActive ? "Deactivate" : "Activate"}
        </span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={async () => {
          const result = await deleteProduct(product.id);
          if (result.success) router.refresh();
        }}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete</span>
      </Button>
    </div>
  );
}
