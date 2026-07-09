import Link from "next/link";
import { Plus } from "lucide-react";

import { db } from "@/lib/db";

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
        <h2 className="text-xl font-semibold text-text-primary">All Products</h2>
        <Link href="/admin/store/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      <div className="rounded-md border border-border">
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
                    <span className={`badge ${totalStock > 0 ? "badge-outline" : "badge-error"}`}>
                      {totalStock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`badge ${p.isActive ? "badge-gold" : "badge-outline"}`}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
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
                <TableCell colSpan={6}>
                  <div className="empty-state py-8">
                    <p className="empty-description">No products found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
