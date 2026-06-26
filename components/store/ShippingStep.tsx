"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/courier/client";
import type { Locker, ShippingMode } from "@/lib/courier/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, MapPin } from "lucide-react";

interface ShippingStepProps {
  shippingMode: ShippingMode;
  onModeChange: (mode: ShippingMode) => void;
  lockerId: string;
  onLockerChange: (lockerId: string) => void;
  shippingCost: number;
  onShippingCostChange: (cost: number) => void;
}

const MODE_OPTIONS: { value: ShippingMode; label: string; description: string }[] = [
  { value: "L2L", label: "Locker to Locker", description: "Collect from a nearby locker — cheapest" },
  { value: "D2D", label: "Door to Door", description: "Delivered to your door" },
];

export function ShippingStep({
  shippingMode,
  onModeChange,
  lockerId,
  onLockerChange,
  shippingCost,
  onShippingCostChange,
}: ShippingStepProps) {
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    const client = createClient();
    client
      .getLockers()
      .then(setLockers)
      .catch(() => setLockers([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredLockers = lockers.filter((l) => l.province);
  const groupedByCity = filteredLockers.reduce<Record<string, Locker[]>>(
    (acc, l) => {
      const city = l.city || "Other";
      if (!acc[city]) acc[city] = [];
      acc[city].push(l);
      return acc;
    },
    {},
  );

  async function handleModeChange(mode: ShippingMode) {
    onModeChange(mode);
    if (mode === "L2L") {
      onShippingCostChange(0);
    } else {
      setCalculating(true);
      try {
        onShippingCostChange(9900);
      } finally {
        setCalculating(false);
      }
    }
  }

  return (
    <div className="space-y-4">
      <Label>Shipping Method</Label>
      <div className="grid gap-3">
        {MODE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleModeChange(opt.value)}
            className={`flex items-start gap-3 rounded-md border p-3 text-left transition-colors ${
              shippingMode === opt.value
                ? "border-primary bg-primary/5"
                : "hover:bg-muted/50"
            }`}
          >
            <div
              className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${
                shippingMode === opt.value
                  ? "border-primary bg-primary"
                  : "border-muted-foreground"
              }`}
            />
            <div className="flex-1">
              <span className="font-medium">{opt.label}</span>
              <p className="text-sm text-muted-foreground">{opt.description}</p>
            </div>
          </button>
        ))}
      </div>

      {shippingMode === "L2L" && (
        <div>
          <Label>Select Locker Location</Label>
          {loading ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading lockers...
            </div>
          ) : lockers.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              No lockers available. Please choose Door to Door.
            </p>
          ) : (
            <Select value={lockerId} onValueChange={onLockerChange}>
              <SelectTrigger className="mt-2 w-full">
                <SelectValue placeholder="Select a locker" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(groupedByCity).map(([city, cityLockers]) => (
                  <div key={city}>
                    <p className="px-2 py-1 text-xs font-medium text-muted-foreground">{city}</p>
                    {cityLockers.map((locker) => (
                      <SelectItem key={locker.id} value={locker.id}>
                        <span className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {locker.name} — {locker.address}
                        </span>
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {calculating && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Calculating shipping...
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Shipping cost</span>
        <span className="font-medium">
          {shippingCost > 0 ? `R${(shippingCost / 100).toFixed(2)}` : "Free (locker)"}
        </span>
      </div>

      {shippingMode === "D2D" && (
        <div className="space-y-2">
          <Label htmlFor="d2d-address">Delivery Address</Label>
          <Input id="d2d-address" name="street" placeholder="123 Main Street" />
          <div className="grid grid-cols-2 gap-2">
            <Input name="city" placeholder="City" />
            <Input name="province" placeholder="Province" />
          </div>
          <Input name="postalCode" placeholder="Postal Code" />
        </div>
      )}
    </div>
  );
}
