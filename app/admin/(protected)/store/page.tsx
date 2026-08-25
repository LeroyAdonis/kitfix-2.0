"use client";

import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

function formatRands(cents: number): string {
  return `R${(cents / 100).toFixed(2)}`;
}

export default function ProductsListPage() {
  const products = useQuery(api.products.list);
  const toggleActive = useMutation(api.products.toggleActive).withOptimisticUpdate(
    (localStore, args) => {
      const currentProducts = localStore.getQuery(api.products.list);
      if (currentProducts) {
        localStore.setQuery(
          api.products.list,
          {},
          currentProducts.map((p) =>
            p._id === args.id ? { ...p, isActive: !p.isActive } : p,
          ),
        );
      }
    },
  );
  const softDelete = useMutation(api.products.softDelete);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (products === undefined) {
    return (
      <div className="text-[var(--color-thread-dim)] font-mono text-xs uppercase tracking-wider py-8">
        Loading products...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="border border-[var(--color-pitch-line)]/40 bg-[var(--color-pitch)]/15 p-12 text-center">
        <p className="font-mono text-sm text-[var(--color-thread-dim)] uppercase tracking-wide mb-4">
          No products yet
        </p>
        <p className="text-[var(--color-thread-dim)] text-sm mb-6">
          Create your first product to start building the storefront.
        </p>
        <Link
          href="/admin/store/new"
          className="inline-block px-5 py-2 bg-[var(--color-stitch)] text-[var(--color-ink)] font-mono text-xs uppercase tracking-[0.18em] hover:opacity-90 transition-opacity"
        >
          Add Product
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-thread-dim)]">
          {products.length} product{products.length !== 1 ? "s" : ""}
        </h2>
        <Link
          href="/admin/store/new"
          className="px-4 py-2 bg-[var(--color-stitch)] text-[var(--color-ink)] font-mono text-xs uppercase tracking-[0.18em] hover:opacity-90 transition-opacity"
        >
          Add Product
        </Link>
      </div>

      <div className="border border-[var(--color-pitch-line)]/40 bg-[var(--color-pitch)]/15 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--color-pitch-line)]/40">
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-thread-dim)]">
                Name
              </th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-thread-dim)]">
                Category
              </th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-thread-dim)]">
                Price
              </th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-thread-dim)]">
                Variants
              </th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-thread-dim)]">
                Total Stock
              </th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-thread-dim)]">
                Status
              </th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-thread-dim)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product._id}
                className="border-b border-[var(--color-pitch-line)]/20 last:border-b-0"
              >
                <td className="px-4 py-3 text-sm text-[var(--color-thread)]">
                  {product.name}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-[var(--color-thread-dim)] uppercase">
                  {product.category}
                </td>
                <td className="px-4 py-3 font-mono text-sm text-[var(--color-stitch)]">
                  {formatRands(product.displayPrice)}
                </td>
                <td className="px-4 py-3 font-mono text-sm text-[var(--color-thread-dim)]">
                  {product.variantCount}
                </td>
                <td className="px-4 py-3 font-mono text-sm text-[var(--color-thread-dim)]">
                  {product.totalStock}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ${
                      product.isActive
                        ? "bg-[var(--color-pitch-line)]/30 text-[var(--color-pitch-line)]"
                        : "bg-[var(--color-foul)]/20 text-[var(--color-foul)]"
                    }`}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <Link
                      href={`/admin/store/${product._id}`}
                      className="text-[var(--color-stitch)] hover:underline"
                    >
                      Edit
                    </Link>
                    <span className="text-[var(--color-pitch-line)]/40">|</span>
                    <button
                      onClick={() => toggleActive({ id: product._id })}
                      className="text-[var(--color-thread-dim)] hover:text-[var(--color-stitch)] transition-colors"
                    >
                      {product.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <span className="text-[var(--color-pitch-line)]/40">|</span>
                    {deletingId === product._id ? (
                      <span className="flex flex-col gap-1">
                        <span className="text-[10px] text-[var(--color-thread-dim)] whitespace-nowrap">
                          Delete {product.name}? This hides it from the storefront.
                        </span>
                        <span className="flex items-center gap-1">
                          <button
                            onClick={async () => {
                              await softDelete({ id: product._id });
                              setDeletingId(null);
                            }}
                            className="text-[var(--color-foul)] hover:underline"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="text-[var(--color-thread-dim)] hover:underline"
                          >
                            Cancel
                          </button>
                        </span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setDeletingId(product._id)}
                        className="text-[var(--color-thread-dim)] hover:text-[var(--color-foul)] transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
