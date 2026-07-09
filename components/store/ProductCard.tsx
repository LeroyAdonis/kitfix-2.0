import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Shirt } from "lucide-react";

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
    <motion.div
      className="group relative overflow-hidden rounded-lg bg-surface border border-white/[0.04]"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/shop/${product.slug}`} className="block">
        {/* Image area */}
        <div className="relative flex aspect-square items-center justify-center bg-bg-elevated overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <Shirt className="h-16 w-16 text-text-tertiary/40" />
          )}

          {/* Green border reveal on hover */}
          <div className="absolute inset-0 border border-green-400/0 group-hover:border-green-400/20 transition-all duration-500 pointer-events-none" />

          {/* Editorial corner markers */}
          <div className="absolute top-0 left-0 h-8 w-8 border-t border-l border-transparent group-hover:border-green-400/30 transition-colors duration-500" />
          <div className="absolute top-0 right-0 h-8 w-8 border-t border-r border-transparent group-hover:border-green-400/30 transition-colors duration-500" />
          <div className="absolute bottom-0 left-0 h-8 w-8 border-b border-l border-transparent group-hover:border-green-400/30 transition-colors duration-500" />
          <div className="absolute bottom-0 right-0 h-8 w-8 border-b border-r border-transparent group-hover:border-green-400/30 transition-colors duration-500" />
        </div>

        {/* Content area */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-display text-sm font-semibold text-text-primary group-hover:text-green-400 transition-colors duration-300">
                {product.name}
              </h3>
              <p className="mt-1 text-[10px] font-medium tracking-[0.15em] uppercase text-text-tertiary">
                {product.category}
              </p>
            </div>
          </div>
        </div>

        {/* Footer area */}
        <div className="flex items-center justify-between border-t border-white/[0.04] px-4 py-3">
          <span className="font-display text-sm font-bold text-text-primary">
            {formatCurrency(product.basePrice)}
          </span>
          {totalStock === 0 ? (
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">Out of stock</Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-green-400/60 border-green-400/20">
              {product.variants.length} sizes
            </Badge>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
