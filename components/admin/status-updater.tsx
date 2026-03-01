"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateRepairStatusAction } from "@/actions/admin";
import type { RepairStatus } from "@/types";

interface StatusUpdaterProps {
  repairId: string;
  currentStatus: RepairStatus;
  onUpdate?: () => void;
}

/** Valid next-status transitions in the pipeline. */
const STATUS_FLOW: Record<RepairStatus, RepairStatus[]> = {
  submitted: ["reviewed"],
  reviewed: ["in_repair"],
  in_repair: ["quality_check"],
  quality_check: ["shipped"],
  shipped: [],
};

const STATUS_LABELS: Record<RepairStatus, string> = {
  submitted: "Submitted",
  reviewed: "Reviewed",
  in_repair: "In Repair",
  quality_check: "Quality Check",
  shipped: "Shipped",
};

export function StatusUpdater({
  repairId,
  currentStatus,
  onUpdate,
}: StatusUpdaterProps) {
  const [selectedStatus, setSelectedStatus] = useState<RepairStatus | "">("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const nextStatuses = STATUS_FLOW[currentStatus];

  if (nextStatuses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This repair has reached its final status.
      </p>
    );
  }

  function handleSubmit() {
    if (!selectedStatus) return;
    setError(null);

    startTransition(async () => {
      const result = await updateRepairStatusAction(
        repairId,
        selectedStatus,
        notes || undefined,
      );
      if (result.success) {
        setSelectedStatus("");
        setNotes("");
        onUpdate?.();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Move to:</span>
        <Select
          value={selectedStatus}
          onValueChange={(v) => setSelectedStatus(v as RepairStatus)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {nextStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Textarea
        placeholder="Optional notes about this status change…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        onClick={handleSubmit}
        disabled={!selectedStatus || isPending}
        size="sm"
      >
        {isPending ? "Updating…" : "Update Status"}
      </Button>
    </div>
  );
}
