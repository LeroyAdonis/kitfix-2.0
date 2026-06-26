import Link from "next/link";
import { Shirt } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    category: string;
    imageUrl: string | null;
    variants: Array<{ id: string; stock: number }>;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      <Link href={`/shop/${product.slug}`}>
        <CardHeader className="p-0">
          <div className="flex aspect-square items-center justify-center bg-muted">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Shirt className="h-16 w-16 text-muted-foreground/40" />
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold">{product.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground capitalize">{product.category}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t px-4 py-3">
          <span className="font-bold">{formatCurrency(product.basePrice)}</span>
          {totalStock === 0 ? (
            <Badge variant="secondary">Out of stock</Badge>
          ) : (
            <Badge variant="outline">{product.variants.length} sizes</Badge>
          )}
        </CardFooter>
      </Link>
    </Card>
  );
}
