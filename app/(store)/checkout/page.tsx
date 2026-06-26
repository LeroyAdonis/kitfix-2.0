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
      <div className="empty-state">
        <ShoppingCart className="empty-icon" />
        <h2 className="empty-heading">Something went wrong</h2>
        <p className="empty-description">{result.error}</p>
        <Link href="/shop" className="btn-primary">
          Back to Shop
        </Link>
      </div>
    );
  }

  const { items, itemTotal } = result.data;

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <ShoppingCart className="empty-icon" />
        <h2 className="empty-heading">Your cart is empty</h2>
        <p className="empty-description">Add some jerseys before checking out.</p>
        <Link href="/shop" className="btn-primary">
          <ArrowLeft className="h-4 w-4" />
          Browse Products
        </Link>
      </div>
    );
  }

  return <CheckoutForm items={items} itemTotal={itemTotal} />;
}
