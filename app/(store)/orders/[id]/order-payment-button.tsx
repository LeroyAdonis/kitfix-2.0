"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { initiateOrderCheckout } from "@/actions/orders";

interface OrderPaymentButtonProps {
  orderId: string;
}

export function OrderPaymentButton({ orderId }: OrderPaymentButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setPending(true);
    setError(null);

    const result = await initiateOrderCheckout(orderId);
    if (!result.success) {
      setError(result.error);
      setPending(false);
      return;
    }

    router.push(result.data.checkoutUrl);
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handlePay}
        disabled={pending}
        className="w-full"
        size="lg"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Redirecting...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Complete Payment &mdash; Pay with Card
          </>
        )}
      </Button>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
