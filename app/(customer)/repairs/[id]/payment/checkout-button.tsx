"use client";

import { useTransition, useState } from "react";
import { initiateCheckout } from "@/actions/payments";
import { formatCurrency } from "@/lib/utils";

interface PaymentCheckoutButtonProps {
  repairRequestId: string;
  amount: number;
  hasPendingPayment: boolean;
}

export function PaymentCheckoutButton({
  repairRequestId,
  amount,
  hasPendingPayment,
}: PaymentCheckoutButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCheckout() {
    setError(null);
    startTransition(async () => {
      const result = await initiateCheckout(repairRequestId);
      if (result.success) {
        // Redirect to Polar checkout page
        window.location.href = result.data.checkoutUrl;
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleCheckout}
        disabled={isPending}
        className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? "Redirecting to checkout…"
          : hasPendingPayment
            ? `Retry Payment — ${formatCurrency(amount)}`
            : `Pay Now — ${formatCurrency(amount)}`}
      </button>
    </div>
  );
}
