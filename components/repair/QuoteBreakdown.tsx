import { formatCurrency } from "@/lib/utils";

interface QuoteBreakdownProps {
  repairCost: number;
  pickupFee: number;
  deliveryFee: number;
  shippingRateCents: number | null;
  shippingSurchargeCents: number | null;
  shippingMode: string | null;
}

export function QuoteBreakdown({
  repairCost,
  pickupFee,
  deliveryFee,
  shippingRateCents,
  shippingSurchargeCents,
  shippingMode,
}: QuoteBreakdownProps) {
  const totalShipping = (shippingRateCents ?? 0) + (shippingSurchargeCents ?? 0);
  const totalCost = repairCost + pickupFee + deliveryFee + totalShipping;
  const depositAmount = Math.ceil(totalCost / 2);

  return (
    <div className="space-y-3 rounded-md border p-4">
      <h3 className="font-medium">Cost Breakdown</h3>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Repair</span>
          <span>{formatCurrency(repairCost)}</span>
        </div>
        {pickupFee > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Pickup fee</span>
            <span>{formatCurrency(pickupFee)}</span>
          </div>
        )}
        {deliveryFee > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Delivery fee</span>
            <span>{formatCurrency(deliveryFee)}</span>
          </div>
        )}
        {shippingMode && totalShipping > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping ({shippingMode})</span>
            <span>{formatCurrency(totalShipping)}</span>
          </div>
        )}
        <div className="border-t pt-1 font-medium">
          <div className="flex justify-between">
            <span>Total</span>
            <span>{formatCurrency(totalCost)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Deposit (50%)</span>
            <span>{formatCurrency(depositAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
