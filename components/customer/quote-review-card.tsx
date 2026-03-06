"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptQuoteAction, declineQuoteAction } from "@/actions/quotes";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, Loader2, MapPin, RotateCcw, Truck } from "lucide-react";

const SA_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
] as const;

interface QuoteReviewCardProps {
  repairId: string;
  /** Estimated repair cost in cents */
  estimatedCost: number;
  /** Pickup fee in cents (0 when no pickup) */
  pickupFee: number;
  /** Delivery fee in cents */
  deliveryFee: number;
  /** Whether a physical pickup is needed before repair can begin */
  pickupRequired: boolean;
  adminNotes: string | null;
  jerseyDescription: string;
  damageType: string;
}

export function QuoteReviewCard({
  repairId,
  estimatedCost,
  pickupFee,
  deliveryFee,
  pickupRequired,
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

  // Pickup address state
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const totalCost = estimatedCost + pickupFee + deliveryFee;
  const depositAmount = Math.ceil(totalCost / 2);
  const remainingAmount = totalCost - depositAmount;

  const pickupAddressValid =
    !pickupRequired ||
    (street.length >= 5 &&
      city.length >= 2 &&
      province.length >= 2 &&
      postalCode.length >= 4 &&
      contactName.length >= 2 &&
      /^(\+27|0)\d{9}$/.test(contactPhone));

  function handleAccept() {
    setError(null);
    startTransition(async () => {
      const pickupAddress = pickupRequired
        ? {
            street,
            city,
            province,
            postalCode,
            country: "South Africa",
            contactName,
            contactPhone,
            specialInstructions: specialInstructions || undefined,
          }
        : undefined;

      const result = await acceptQuoteAction(repairId, pickupAddress);
      if (result.success) {
        setSuccess(
          "Quote accepted! Please proceed to pay your 50% deposit.",
        );
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

          {/* Quote Breakdown */}
          <div className="rounded-md bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Repair Cost</span>
              <span>{formatCurrency(estimatedCost)}</span>
            </div>
            {pickupFee > 0 && (
              <div className="flex justify-between text-sm text-orange-600 dark:text-orange-400">
                <span className="flex items-center gap-1">
                  <Truck className="h-3 w-3" /> Pickup Fee
                </span>
                <span>{formatCurrency(pickupFee)}</span>
              </div>
            )}
            {deliveryFee > 0 && (
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
            )}
            <hr className="border-border" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(totalCost)}</span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Due Now (50% Deposit)
              </span>
              <span className="font-semibold">
                {formatCurrency(depositAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Due on Completion</span>
              <span>{formatCurrency(remainingAmount)}</span>
            </div>
          </div>

          {/* Pickup Address Form (when required) */}
          {pickupRequired && (
            <div className="rounded-md border border-orange-200 bg-orange-50 p-4 space-y-3 dark:border-orange-800 dark:bg-orange-950">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                  Pickup Address Required
                </p>
              </div>
              <p className="text-xs text-orange-700 dark:text-orange-400">
                We need to collect your jersey for physical inspection. Please
                provide a pickup address.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-1">
                  <Label htmlFor="pickup-street" className="text-xs">
                    Street Address
                  </Label>
                  <Input
                    id="pickup-street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="42 Main Street"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pickup-city" className="text-xs">
                    City
                  </Label>
                  <Input
                    id="pickup-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Johannesburg"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pickup-province" className="text-xs">
                    Province
                  </Label>
                  <Select value={province} onValueChange={setProvince}>
                    <SelectTrigger id="pickup-province">
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                      {SA_PROVINCES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pickup-postal" className="text-xs">
                    Postal Code
                  </Label>
                  <Input
                    id="pickup-postal"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="2001"
                    maxLength={10}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pickup-contact" className="text-xs">
                    Contact Name
                  </Label>
                  <Input
                    id="pickup-contact"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Thabo Mokoena"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pickup-phone" className="text-xs">
                    Contact Phone
                  </Label>
                  <Input
                    id="pickup-phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="0821234567"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label htmlFor="pickup-instructions" className="text-xs">
                    Special Instructions (optional)
                  </Label>
                  <Textarea
                    id="pickup-instructions"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Ring doorbell twice, gate code 1234"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          <details className="text-sm text-muted-foreground">
            <summary className="cursor-pointer font-medium text-foreground">
              Cancellation Policy
            </summary>
            <ul className="mt-2 space-y-1 pl-4 list-disc">
              <li>Before work starts: free cancellation</li>
              <li>
                Quote accepted (payment made): 15% fee, instant cancellation
              </li>
              <li>
                Once repair has started: 50% charge applies (request reviewed by
                team)
              </li>
              <li>
                During quality check: 85% charge applies (request reviewed by
                team)
              </li>
              <li>Your jersey is always returned to you</li>
            </ul>
          </details>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={handleAccept}
              disabled={isPending || !pickupAddressValid}
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
                  {pickupRequired ? "Accept & Pay Deposit" : "Accept Quote"}
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
