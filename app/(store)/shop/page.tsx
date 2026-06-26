import { Shirt } from "lucide-react";
import Link from "next/link";

import { getActiveProducts } from "@/lib/db/queries/products";
import { ProductCard } from "@/components/store/ProductCard";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Shop — KitFix",
  description: "Browse our jersey collection",
};

export default async function ShopPage() {
  const products = await getActiveProducts();

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Shirt className="h-12 w-12" />}
        title="No products yet"
        description="Our jersey collection is coming soon. Check back later!"
        action={
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shop</h1>
        <p className="mt-1 text-muted-foreground">
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
