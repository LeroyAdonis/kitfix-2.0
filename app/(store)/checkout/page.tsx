import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, ArrowLeft } from "lucide-react";

import { getSession } from "@/lib/auth-utils";
import { getEnrichedCart } from "@/actions/cart-enriched";
import { CheckoutForm } from "./checkout-form";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const result = await getEnrichedCart();

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-green-400/10 mb-6">
          <ShoppingCart className="h-8 w-8 text-green-400/60" />
        </div>
        <h2 className="font-display text-2xl font-bold text-text-primary">Something went wrong</h2>
        <p className="mt-2 max-w-sm text-sm text-text-secondary">{result.error}</p>
        <Link href="/shop" className="mt-8 inline-flex rounded-lg border border-green-400/20 bg-green-400/10 px-4 py-2.5 text-sm font-semibold text-green-400 transition-all duration-300 hover:bg-green-400/20">
          Back to Shop
        </Link>
      </div>
    );
  }

  const { items, itemTotal } = result.data;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-green-400/10 mb-6">
          <ShoppingCart className="h-8 w-8 text-green-400/60" />
        </div>
        <h2 className="font-display text-2xl font-bold text-text-primary">Your cart is empty</h2>
        <p className="mt-2 max-w-sm text-sm text-text-secondary">Add some jerseys before checking out.</p>
        <Link href="/shop" className="mt-8 inline-flex rounded-lg border border-green-400/20 bg-green-400/10 px-4 py-2.5 text-sm font-semibold text-green-400 transition-all duration-300 hover:bg-green-400/20">
          <ArrowLeft className="h-4 w-4" />
          Browse Products
        </Link>
      </div>
    );
  }

  return <CheckoutForm items={items} itemTotal={itemTotal} />;
}
