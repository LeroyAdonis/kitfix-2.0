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
    <div className="grid gap-10 md:grid-cols-2">
      {/* Image section */}
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-surface border border-white/[0.04] group">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="rounded-xl object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <Shirt className="h-24 w-24 text-text-tertiary/40" />
        )}
        {/* Editorial corner markers */}
        <div className="absolute top-0 left-0 h-10 w-10 border-t border-l border-transparent group-hover:border-green-400/30 transition-colors duration-500" />
        <div className="absolute top-0 right-0 h-10 w-10 border-t border-r border-transparent group-hover:border-green-400/30 transition-colors duration-500" />
        <div className="absolute bottom-0 left-0 h-10 w-10 border-b border-l border-transparent group-hover:border-green-400/30 transition-colors duration-500" />
        <div className="absolute bottom-0 right-0 h-10 w-10 border-b border-r border-transparent group-hover:border-green-400/30 transition-colors duration-500" />
      </div>

      {/* Details section */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8 bg-green-400/40" />
            <p className="text-[10px] font-semibold tracking-[0.3em] text-green-400 uppercase">{product.category}</p>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-[-0.02em] text-text-primary sm:text-4xl">{product.name}</h1>
          <p className="mt-3 text-2xl font-semibold text-green-400">{formatCurrency(product.basePrice)}</p>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-green-400/20 via-green-400/10 to-transparent" />

        <p className="text-sm leading-relaxed text-text-secondary">{product.description}</p>

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
