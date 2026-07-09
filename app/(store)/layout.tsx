import Link from "next/link";
import { redirect } from "next/navigation";
import { Store } from "lucide-react";

import { CartBadge } from "@/components/store/CartBadge";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSessionFromHeaders } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionFromHeaders();
  if (!session) redirect("/sign-in");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-color-border bg-bg-deep/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/shop" className="flex items-center gap-2 font-semibold text-text-primary">
              <Store className="h-5 w-5 text-brand-green-bright" />
              Shop
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-brand-green-bright"
              >
                All Products
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link
              href="/"
              className="text-sm text-text-secondary transition-colors hover:text-text-primary ml-2"
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
