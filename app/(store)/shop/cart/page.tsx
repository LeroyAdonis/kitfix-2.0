import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, ArrowLeft } from "lucide-react";

import { getSession } from "@/lib/auth-utils";
import { getEnrichedCart } from "@/actions/cart-enriched";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { CartContent } from "./cart-content";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const result = await getEnrichedCart();

  if (!result.success) {
    return (
      <EmptyState
        icon={<ShoppingCart className="h-12 w-12" />}
        title="Something went wrong"
        description={result.error}
        action={
          <Button asChild>
            <Link href="/shop">Back to Shop</Link>
          </Button>
        }
      />
    );
  }

  const { items, itemTotal } = result.data;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart className="h-12 w-12" />}
        title="Your cart is empty"
        description="Looks like you haven't added any jerseys yet."
        action={
          <Button asChild>
            <Link href="/shop">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse Products
            </Link>
          </Button>
        }
      />
    );
  }

  return <CartContent items={items} itemTotal={itemTotal} />;
}
