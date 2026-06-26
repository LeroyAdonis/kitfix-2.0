"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrderStatusAction } from "@/actions/admin-store";

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusUpdater({ orderId, currentStatus }: OrderStatusUpdaterProps) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const allowedTransitions = STATUS_TRANSITIONS[currentStatus] ?? [];

  async function handleUpdate() {
    if (!status) return;

    setLoading(true);
    setError(null);

    const result = await updateOrderStatusAction(orderId, status);

    if (result.success) {
      router.refresh();
    } else {
      setError(result.error);
    }

    setLoading(false);
  }

  if (allowedTransitions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No further status changes available.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger>
          <SelectValue placeholder="Select new status" />
        </SelectTrigger>
        <SelectContent>
          {allowedTransitions.map((s) => (
            <SelectItem key={s} value={s} className="capitalize">
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button
        onClick={handleUpdate}
        disabled={!status || loading}
        className="w-full"
      >
        {loading ? "Updating..." : "Update Status"}
      </Button>
    </div>
  );
}
