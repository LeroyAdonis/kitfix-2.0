"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  updateEstimateAction,
  addTrackingNumberAction,
  addAdminNotesAction,
} from "@/actions/admin";
import { formatCurrency } from "@/lib/utils";

interface RepairDetailViewProps {
  repairId: string;
  estimatedCost: number | null;
  trackingNumber: string | null;
  adminNotes: string | null;
}

export function RepairDetailView({
  repairId,
  estimatedCost,
  trackingNumber,
  adminNotes,
}: RepairDetailViewProps) {
  return (
    <>
      <EstimateCard repairId={repairId} currentEstimate={estimatedCost} />
      <TrackingCard repairId={repairId} currentTracking={trackingNumber} />
      <NotesCard repairId={repairId} currentNotes={adminNotes} />
    </>
  );
}

function EstimateCard({
  repairId,
  currentEstimate,
}: {
  repairId: string;
  currentEstimate: number | null;
}) {
  const [value, setValue] = useState(
    currentEstimate != null ? String(currentEstimate / 100) : "",
  );
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSave() {
    const cents = Math.round(Number(value) * 100);
    if (isNaN(cents) || cents <= 0) {
      setMessage("Please enter a valid amount");
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const result = await updateEstimateAction(repairId, cents);
      setMessage(result.success ? "Estimate saved" : result.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Estimate (ZAR)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {currentEstimate != null && (
          <p className="text-sm text-muted-foreground">
            Current: {formatCurrency(currentEstimate)}
          </p>
        )}
        <div className="flex gap-2">
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 350.00"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button size="sm" onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </div>
        {message && (
          <p className="text-xs text-muted-foreground">{message}</p>
        )}
      </CardContent>
    </Card>
  );
}

function TrackingCard({
  repairId,
  currentTracking,
}: {
  repairId: string;
  currentTracking: string | null;
}) {
  const [value, setValue] = useState(currentTracking ?? "");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSave() {
    if (!value.trim()) {
      setMessage("Please enter a tracking number");
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const result = await addTrackingNumberAction(repairId, value.trim());
      setMessage(result.success ? "Tracking number saved" : result.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tracking Number</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {currentTracking && (
          <p className="text-sm text-muted-foreground">
            Current: {currentTracking}
          </p>
        )}
        <div className="flex gap-2">
          <Input
            placeholder="e.g. ZA123456789"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button size="sm" onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </div>
        {message && (
          <p className="text-xs text-muted-foreground">{message}</p>
        )}
      </CardContent>
    </Card>
  );
}

function NotesCard({
  repairId,
  currentNotes,
}: {
  repairId: string;
  currentNotes: string | null;
}) {
  const [value, setValue] = useState(currentNotes ?? "");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const result = await addAdminNotesAction(repairId, value);
      setMessage(result.success ? "Notes saved" : result.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Admin Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Textarea
          placeholder="Internal notes about this repair…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
        />
        <Button size="sm" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving…" : "Save Notes"}
        </Button>
        {message && (
          <p className="text-xs text-muted-foreground">{message}</p>
        )}
      </CardContent>
    </Card>
  );
}
