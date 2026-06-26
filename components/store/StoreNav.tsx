"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, ShoppingCart } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { CartBadge } from "./CartBadge";

const storeLinks = [
  { href: "/shop", label: "All Products" },
];

export function StoreNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/shop" className="flex items-center gap-2 font-semibold">
          <Store className="h-5 w-5" />
          Shop
        </Link>
        <div className="flex items-center gap-1">
          {storeLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "text-sm",
                pathname === link.href && "bg-muted",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <CartBadge />
    </nav>
  );
}
