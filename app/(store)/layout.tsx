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
    <div className="flex min-h-screen flex-col bg-bg-deep">
      {/* Header with editorial styling */}
      <header className="sticky top-0 z-50 border-b border-white/[0.03] bg-bg-deep/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link
              href="/shop"
              className="flex items-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase text-white/80 hover:text-green-400 transition-colors duration-300 group"
            >
              <Store className="h-4 w-4 text-green-400" />
              <span className="relative">
                Shop
                <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-green-400/60 scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100" />
              </span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              <Link
                href="/shop"
                className="relative px-3 py-2 text-[10px] font-medium tracking-[0.2em] uppercase text-text-secondary transition-colors duration-300 hover:text-green-400 group"
              >
                All Products
                <span className="absolute -bottom-0.5 left-3 right-3 h-px bg-green-400/60 scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100" />
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link
              href="/"
              className="relative px-3 py-2 text-[10px] font-medium tracking-[0.2em] uppercase text-text-secondary transition-colors duration-300 hover:text-green-400 group"
            >
              Home
              <span className="absolute -bottom-0.5 left-3 right-3 h-px bg-green-400/60 scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100" />
            </Link>
            <CartBadge />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
