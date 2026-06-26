import Link from "next/link";
import { Plus } from "lucide-react";

import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDateSAST } from "@/lib/utils";
import { ProductActions } from "./product-actions";

export default async function AdminProductsPage() {
  const allProducts = await db.query.products.findMany({
    with: { variants: true },
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">All Products</h2>
        <Button asChild>
          <Link href="/admin/store/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allProducts.map((p) => {
              const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{formatCurrency(p.basePrice)}</TableCell>
                  <TableCell>
                    <Badge variant={totalStock > 0 ? "outline" : "destructive"}>
                      {totalStock}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.isActive ? "default" : "secondary"}>
                      {p.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDateSAST(new Date(p.createdAt))}
                  </TableCell>
                  <TableCell>
                    <ProductActions product={p} />
                  </TableCell>
                </TableRow>
              );
            })}
            {allProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
