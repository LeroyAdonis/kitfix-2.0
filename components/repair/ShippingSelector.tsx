"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { createClient } from "@/lib/courier/client";
import { getShippingCost, formatShippingCost } from "@/lib/shipping/rates";
import type { Locker, ShippingMode } from "@/lib/courier/types";

interface ShippingSelectorProps {
  onSelect: (params: {
    mode: ShippingMode;
    lockerId?: string;
    address?: string;
    postalCode: string;
    city: string;
    costCents: number;
  }) => void;
  direction: "outbound" | "return";
  defaultMode?: ShippingMode;
}

const SHIPPING_MODES: { mode: ShippingMode; label: string; desc: string }[] = [
  { mode: "L2L", label: "Locker to Locker", desc: "Drop off & collect at a locker" },
  { mode: "D2L", label: "Door to Locker", desc: "We collect from your door, you collect from locker" },
  { mode: "L2D", label: "Locker to Door", desc: "You drop at locker, we deliver to your door" },
  { mode: "D2D", label: "Door to Door", desc: "We collect & deliver to your door" },
];

import { cn } from "@/lib/utils";

export function ShippingSelector({ onSelect, direction, defaultMode = "L2L" }: ShippingSelectorProps) {
  const [mode, setMode] = useState<ShippingMode>(defaultMode);
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [selectedLocker, setSelectedLocker] = useState<string>("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [cost, setCost] = useState<{ totalCents: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const client = createClient();
    client.getLockers().then(setLockers).catch(() => {});
  }, []);

  useEffect(() => {
    if (!postalCode) return;
    setLoading(true);
    setError("");
    getShippingCost(mode, 1, "8001", postalCode, city)
      .then((c) => setCost(c))
      .catch(() => setError("Could not calculate shipping"))
      .finally(() => setLoading(false));
  }, [mode, postalCode, city]);

  const needsLocker = mode === "L2L" || mode === "L2D";
  const needsAddress = mode === "D2D" || mode === "D2L";

  function handleConfirm() {
    onSelect({
      mode,
      lockerId: needsLocker ? selectedLocker : undefined,
      address: needsAddress ? address : undefined,
      postalCode,
      city,
      costCents: cost?.totalCents ?? 0,
    });
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-content-tertiary">
        {direction === "outbound" ? "Ship to Us" : "Return Delivery"}
      </h3>

      {/* Mode selector */}
      <div className="grid gap-2">
        {SHIPPING_MODES.map((s) => (
          <button
            key={s.mode}
            onClick={() => setMode(s.mode)}
            className={cn(
              "flex items-center justify-between rounded-lg border p-3 text-left text-sm transition-colors",
              mode === s.mode
                ? "border-brand-gold bg-brand-gold/5 text-content"
                : "border-border-default bg-surface text-content-secondary hover:border-border-default"
            )}
          >
            <div>
              <span className="font-medium">{s.label}</span>
              <p className="text-xs text-content-tertiary">{s.desc}</p>
            </div>
            {mode === s.mode && <span className="text-brand-gold text-lg">✓</span>}
          </button>
        ))}
      </div>

      {/* Locker selector */}
      {needsLocker && (
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-content-tertiary">
            Choose a Locker
          </label>
          <select
            value={selectedLocker}
            onChange={(e) => setSelectedLocker(e.target.value)}
            className="w-full rounded-lg border border-border-default bg-surface p-2.5 text-sm text-content focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
          >
            <option value="">Select a locker location</option>
            {lockers.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} — {l.city}, {l.province}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Address fields */}
      {needsAddress && (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-content-tertiary">
              Street Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main Street"
              className="w-full rounded-lg border border-border-default bg-surface p-2.5 text-sm text-content placeholder:text-content-tertiary focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-content-tertiary">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Cape Town"
                className="w-full rounded-lg border border-border-default bg-surface p-2.5 text-sm text-content placeholder:text-content-tertiary focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-content-tertiary">
                Postal Code
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="8001"
                className="w-full rounded-lg border border-border-default bg-surface p-2.5 text-sm text-content placeholder:text-content-tertiary focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
              />
            </div>
          </div>
        </div>
      )}

      {/* Cost */}
      {loading && <p className="text-sm text-content-tertiary">Calculating shipping...</p>}
      {error && <p className="text-sm text-status-error">{error}</p>}
      {cost && !loading && (
        <div className="rounded-lg bg-surface p-3">
          <div className="flex justify-between text-sm">
            <span className="text-content-secondary">Shipping</span>
            <span className="font-medium text-content">{formatShippingCost(cost.totalCents)}</span>
          </div>
        </div>
      )}

      {/* Confirm */}
      <button
        onClick={handleConfirm}
        disabled={!cost || loading || (needsLocker && !selectedLocker) || (needsAddress && (!address || !postalCode))}
        className="w-full rounded-lg bg-brand-gold py-2.5 text-sm font-bold text-text-inverse transition-all hover:bg-brand-gold-dark disabled:opacity-40"
      >
        Confirm Shipping
      </button>
    </div>
  );
}
