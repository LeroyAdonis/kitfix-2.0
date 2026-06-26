"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCart } from "@/actions/cart";

export function CartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    getCart().then((res) => {
      if (res.success) {
        setCount(res.data.items.reduce((sum, item) => sum + item.quantity, 0));
      }
    });
  }, []);

  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <Link href="/shop/cart">
        <ShoppingCart className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Link>
    </Button>
  );
}
