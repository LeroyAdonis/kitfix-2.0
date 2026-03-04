"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptQuoteAction, declineQuoteAction } from "@/actions/quotes";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, Loader2, RotateCcw } from "lucide-react";

interface QuoteReviewCardProps {
  repairId: string;
  /** Estimated cost in cents */
  estimatedCost: number;
  adminNotes: string | null;
  jerseyDescription: string;
  damageType: string;
}

export function QuoteReviewCard({
  repairId,
  estimatedCost,
  adminNotes,
  jerseyDescription,
  damageType,
}: QuoteReviewCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reason, setReason] = useState("");

  function handleAccept() {
    setError(null);
    startTransition(async () => {
      const result = await acceptQuoteAction(repairId);
      if (result.success) {
        setSuccess("Quote accepted! Your repair will begin shortly.");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function handleDecline() {
    if (reason.trim().length < 10) return;
    setError(null);
    startTransition(async () => {
      const result = await declineQuoteAction(repairId, reason.trim());
      if (result.success) {
        setDialogOpen(false);
        setReason("");
        setSuccess("Re-quote requested. We'll update your quote shortly.");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  if (success) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>{success}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quote Ready for Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Jersey
              </p>
              <p className="text-sm">{jerseyDescription}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Damage Type
              </p>
              <Badge variant="outline" className="mt-0.5 capitalize">
                {damageType.replace(/_/g, " ")}
              </Badge>
            </div>
          </div>

          {adminNotes && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Notes from our team
              </p>
              <p className="text-sm">{adminNotes}</p>
            </div>
          )}

          <div className="rounded-md bg-muted/50 p-4 text-center">
            <p className="text-xs font-medium text-muted-foreground">
              Quoted Price
            </p>
            <p className="text-2xl font-bold">
              {formatCurrency(estimatedCost)}
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={handleAccept}
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accept Quote
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(true)}
              disabled={isPending}
              className="flex-1"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Request Re-quote
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request a Re-quote</DialogTitle>
            <DialogDescription>
              Tell us why you&apos;d like a revised quote. Our team will review
              and send an updated estimate.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Textarea
              placeholder="e.g. The price seems high for a minor tear repair…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              minLength={10}
              maxLength={500}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              {reason.length}/500 characters (minimum 10)
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDecline}
              disabled={isPending || reason.trim().length < 10}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Re-quote Request"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
