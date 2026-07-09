import { notFound } from "next/navigation";
import Image from "next/image";
import { Shirt } from "lucide-react";

import { getProductBySlug } from "@/lib/db/queries/products";
import { formatCurrency } from "@/lib/utils";
import { ProductDetailClient } from "./product-detail-client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found — KitFix" };
  return {
    title: `${product.name} — KitFix Shop`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="relative flex aspect-square items-center justify-center rounded-lg bg-muted">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="rounded-lg object-cover"
          />
        ) : (
          <Shirt className="h-24 w-24 text-muted-foreground/40" />
        )}
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-sm capitalize text-muted-foreground">{product.category}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(product.basePrice)}</p>
        </div>

        <p className="text-muted-foreground">{product.description}</p>

        <ProductDetailClient
          productId={product.id}
          variants={product.variants}
          personalizationOptions={product.personalizationOptions.map((po) => ({
            id: po.id,
            fieldName: po.fieldName,
            fieldType: po.fieldType,
            isRequired: po.isRequired,
            maxLength: po.maxLength,
            options: po.options as string[] | null,
          }))}
          basePrice={product.basePrice}
        />
      </div>
    </div>
  );
}
