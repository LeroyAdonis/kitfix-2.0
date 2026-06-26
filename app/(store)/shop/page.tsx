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
      <div className="empty-state">
        <Shirt className="empty-icon" />
        <h2 className="empty-heading">No products yet</h2>
        <p className="empty-description">Our jersey collection is coming soon. Check back later!</p>
        <Link href="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-display">Shop</h1>
        <p className="mt-1 text-text-secondary">
          Browse our collection of {products.length} jersey{products.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
