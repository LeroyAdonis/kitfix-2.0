"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store } from "lucide-react";

import { cn } from "@/lib/utils";
import { CartBadge } from "./CartBadge";

const storeLinks = [
  { href: "/shop", label: "All Products" },
];

export function StoreNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link
          href="/shop"
          className="flex items-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase text-white/80 hover:text-green-400 transition-colors duration-300 group"
        >
          <Store className="h-4 w-4 text-green-400" />
          Shop
        </Link>
        <div className="flex items-center gap-1">
          {storeLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative px-3 py-2 text-[10px] font-medium tracking-[0.2em] uppercase transition-colors duration-300 group",
                pathname === link.href
                  ? "text-green-400"
                  : "text-text-secondary hover:text-green-400",
              )}
            >
              {link.label}
              <span
                className={cn(
                  "absolute -bottom-0.5 left-3 right-3 h-px bg-green-400/60 scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100",
                  pathname === link.href && "scale-x-100",
                )}
              />
            </Link>
          ))}
        </div>
      </div>
      <CartBadge />
    </nav>
  );
}
