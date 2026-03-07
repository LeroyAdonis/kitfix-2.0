"use client";

import { useState, useTransition, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { sendQuoteAction } from "@/actions/quotes";
import { formatCurrency } from "@/lib/utils";
import { getPickupFee, getDeliveryFee } from "@/lib/config/pricing";
import { AlertTriangle, Bot, Truck } from "lucide-react";

interface SendQuoteFormProps {
  repairId: string;
  currentEstimate: number | null;
  currentNotes: string | null;
  quoteDeclineReason: string | null;
  aiAssessed: boolean;
  customerProvince?: string;
  customerCity?: string;
}

export function SendQuoteForm({
  repairId,
  currentEstimate,
  currentNotes,
  quoteDeclineReason,
  aiAssessed,
  customerProvince,
  customerCity,
}: SendQuoteFormProps) {
  const [cost, setCost] = useState(
    currentEstimate != null ? String(currentEstimate / 100) : "",
  );
  const [notes, setNotes] = useState(currentNotes ?? "");
  const [pickupRequired, setPickupRequired] = useState(!aiAssessed);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const feePreview = useMemo(() => {
    const repairCents = Math.round(Number(cost) * 100);
    if (isNaN(repairCents) || repairCents <= 0) return null;

    const pickup = pickupRequired ? getPickupFee(customerProvince, customerCity) : 0;
    const delivery = getDeliveryFee(customerProvince, customerCity);
    const total = repairCents + pickup + delivery;
    const deposit = Math.ceil(total / 2);
    return { repairCents, pickup, delivery, total, deposit, remaining: total - deposit };
  }, [cost, pickupRequired, customerProvince, customerCity]);

  function handleSubmit() {
    const cents = Math.round(Number(cost) * 100);
    if (isNaN(cents) || cents <= 0) {
      setMessage({ type: "error", text: "Please enter a valid positive amount." });
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const result = await sendQuoteAction(
        repairId,
        cents,
        notes.trim() || undefined,
        pickupRequired,
      );
      if (result.success) {
        setMessage({ type: "success", text: "Quote sent to customer." });
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Send Quote</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Assessment Status */}
        {aiAssessed ? (
          <Alert>
            <Bot className="h-4 w-4" />
            <AlertTitle>AI Analysis Available</AlertTitle>
            <AlertDescription>
              Customer completed AI damage assessment. Remote quoting is possible.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>No AI Analysis</AlertTitle>
            <AlertDescription>
              Customer skipped AI assessment. Physical inspection recommended — pickup fee will be added to quote.
            </AlertDescription>
          </Alert>
        )}

        {quoteDeclineReason && (
          <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm dark:border-yellow-700 dark:bg-yellow-950">
            <p className="font-medium text-yellow-800 dark:text-yellow-300">
              Customer requested a re-quote
            </p>
            <p className="mt-1 text-yellow-700 dark:text-yellow-400">
              {quoteDeclineReason}
            </p>
          </div>
        )}

        {currentEstimate != null && (
          <p className="text-sm text-muted-foreground">
            Previous estimate: {formatCurrency(currentEstimate)}
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="quote-cost">Repair Cost (ZAR)</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">R</span>
            <Input
              id="quote-cost"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g. 350.00"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>
        </div>

        {/* Pickup Toggle */}
        <div className="flex items-center justify-between rounded-md border p-3">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <div>
              <Label htmlFor="pickup-toggle" className="text-sm font-medium">
                Require physical pickup
              </Label>
              <p className="text-xs text-muted-foreground">
                {pickupRequired
                  ? "Pickup fee will be added to quote"
                  : "Customer drops off or arranges own delivery"}
              </p>
            </div>
          </div>
          <Switch
            id="pickup-toggle"
            checked={pickupRequired}
            onCheckedChange={setPickupRequired}
          />
        </div>

        {/* Fee Preview */}
        {feePreview && (
          <div className="rounded-md bg-muted/50 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span>Repair</span>
              <span>{formatCurrency(feePreview.repairCents)}</span>
            </div>
            {feePreview.pickup > 0 && (
              <div className="flex justify-between text-orange-600 dark:text-orange-400">
                <span>Pickup Fee</span>
                <span>{formatCurrency(feePreview.pickup)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{formatCurrency(feePreview.delivery)}</span>
            </div>
            <hr className="my-1 border-border" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(feePreview.total)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>50% Deposit</span>
              <span>{formatCurrency(feePreview.deposit)}</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="quote-notes">Admin Notes (optional)</Label>
          <Textarea
            id="quote-notes"
            placeholder="Internal notes about this quote…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {message && (
          <p
            className={
              message.type === "success"
                ? "text-sm text-green-600 dark:text-green-400"
                : "text-sm text-destructive"
            }
          >
            {message.text}
          </p>
        )}

        <Button onClick={handleSubmit} disabled={isPending} size="sm">
          {isPending ? "Sending…" : "Send Quote to Customer"}
        </Button>
      </CardContent>
    </Card>
  );
}
