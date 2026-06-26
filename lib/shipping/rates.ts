import { createClient } from "@/lib/courier/client";
import { isMetroArea } from "@/lib/config/pricing";
import type { ShippingMode } from "@/lib/courier/types";

export const NON_METRO_SURCHARGE_CENTS = 5000; // R50.00

export interface ShippingCost {
  mode: ShippingMode;
  amountCents: number;
  surchargeCents: number;
  totalCents: number;
  estimatedDays: number;
  description: string;
}

export interface ShippingRatesResult {
  bestRate: { amountCents: number; mode: ShippingMode } | null;
  surchargeCents: number;
  allRates: ShippingCost[];
}

/**
 * Get shipping cost for a specific mode and destination.
 */
export async function getShippingCost(
  mode: ShippingMode,
  weightKg: number,
  fromPostalCode: string,
  toPostalCode: string,
  toCity?: string,
): Promise<ShippingCost> {
  const client = createClient();

  try {
    const rates = await client.getRates({
      fromPostalCode,
      toPostalCode,
      mode,
      weightKg,
      heightCm: 30,
      widthCm: 20,
      lengthCm: 5,
    });

    const rate = rates.rates[0];
    const surchargeCents = toCity && !isMetroArea(undefined, toCity) ? NON_METRO_SURCHARGE_CENTS : 0;

    return {
      mode: rate.mode,
      amountCents: rate.amountCents,
      surchargeCents,
      totalCents: rate.amountCents + surchargeCents,
      estimatedDays: rate.estimatedDays,
      description: rate.description,
    };
  } catch {
    // Fallback: estimated pricing when API is unavailable
    const baseRate = mode === "L2L" ? 7990 : mode === "D2D" ? 14990 : 9990;
    const surchargeCents = toCity && !isMetroArea(undefined, toCity) ? NON_METRO_SURCHARGE_CENTS : 0;
    return {
      mode,
      amountCents: baseRate,
      surchargeCents,
      totalCents: baseRate + surchargeCents,
      estimatedDays: mode === "L2L" ? 3 : 2,
      description: `${mode === "L2L" ? "Locker to Locker" : mode === "D2D" ? "Door to Door" : mode === "D2L" ? "Door to Locker" : "Locker to Door"} delivery`,
    };
  }
}

/**
 * Get all shipping rates for a destination and pick the best (cheapest).
 * Compatible with the existing quotes action interface.
 */
export async function getShippingRates(
  fromPostalCode: string,
  toPostalCode: string,
  _province?: string,
  toCity?: string,
): Promise<ShippingRatesResult> {
  const modes: ShippingMode[] = ["L2L", "D2D", "D2L", "L2D"];
  const allRates: ShippingCost[] = [];
  let surchargeCents = 0;

  for (const mode of modes) {
    try {
      const cost = await getShippingCost(mode, 1, fromPostalCode, toPostalCode, toCity);
      allRates.push(cost);
      surchargeCents = cost.surchargeCents;
    } catch {
      // Skip failed modes
    }
  }

  // Sort by total cost, pick cheapest
  allRates.sort((a, b) => a.totalCents - b.totalCents);
  const bestRate = allRates.length > 0
    ? { amountCents: allRates[0].amountCents, mode: allRates[0].mode }
    : null;

  return { bestRate, surchargeCents, allRates };
}

export function formatShippingCost(cents: number): string {
  return `R${(cents / 100).toFixed(2)}`;
}
