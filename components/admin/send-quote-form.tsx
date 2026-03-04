"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sendQuoteAction } from "@/actions/quotes";
import { formatCurrency } from "@/lib/utils";

interface SendQuoteFormProps {
  repairId: string;
  currentEstimate: number | null;
  currentNotes: string | null;
  quoteDeclineReason: string | null;
}

export function SendQuoteForm({
  repairId,
  currentEstimate,
  currentNotes,
  quoteDeclineReason,
}: SendQuoteFormProps) {
  const [cost, setCost] = useState(
    currentEstimate != null ? String(currentEstimate / 100) : "",
  );
  const [notes, setNotes] = useState(currentNotes ?? "");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
          <Label htmlFor="quote-cost">Cost (ZAR)</Label>
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
