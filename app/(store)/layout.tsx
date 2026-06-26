import Link from "next/link";
import { Store } from "lucide-react";

import { CartBadge } from "@/components/store/CartBadge";

export const dynamic = "force-dynamic";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/shop" className="flex items-center gap-2 font-semibold">
              <Store className="h-5 w-5" />
              Shop
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                All Products
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Home
            </Link>
            <CartBadge />
          </div>
        </div>
      </header>
      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
