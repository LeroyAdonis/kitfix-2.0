import { Shirt } from "lucide-react";
import Link from "next/link";

import { getActiveProducts } from "@/lib/db/queries/products";
import { ProductCard } from "@/components/store/ProductCard";

export const metadata = {
  title: "Shop — KitFix",
  description: "Browse our jersey collection",
};

export default async function ShopPage() {
  const products = await getActiveProducts();

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-green-400/10 mb-6">
          <Shirt className="h-8 w-8 text-green-400/60" />
        </div>
        <h2 className="font-display text-2xl font-bold text-text-primary">No products yet</h2>
        <p className="mt-2 max-w-sm text-sm text-text-secondary">Our jersey collection is coming soon. Check back later!</p>
        <Link href="/" className="mt-8 inline-flex rounded-lg border border-green-400/20 bg-green-400/10 px-4 py-2.5 text-sm font-semibold text-green-400 transition-all duration-300 hover:bg-green-400/20">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Editorial header */}
      <div className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-green-400/40" />
          <p className="text-[10px] font-semibold tracking-[0.3em] text-green-400 uppercase">Collection</p>
        </div>
        <h1 className="font-display text-4xl font-bold tracking-[-0.03em] text-text-primary sm:text-5xl">
          Shop
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Browse our collection of {products.length} jersey{products.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Product grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
