export const PRICING = {
  pickupFee: {
    metro: 9900,       // R99.00 in ZAR cents
    nonMetro: 14900,   // R149.00 in ZAR cents
  },
  deliveryFee: {
    metro: 9900,       // R99.00 in ZAR cents
    nonMetro: 14900,   // R149.00 in ZAR cents
  },
  metroProvinces: ["Gauteng"],
  metroCities: [
    "Johannesburg", "Pretoria", "Cape Town", "Durban",
    "Port Elizabeth", "Bloemfontein",
  ],
} as const;

/**
 * Determine if a province/city combination qualifies for metro rates.
 * Falls back to non-metro if either is undefined or unrecognised.
 */
export function isMetroArea(
  province?: string,
  city?: string,
): boolean {
  if (province && PRICING.metroProvinces.some(
    (p) => p.toLowerCase() === province.toLowerCase(),
  )) {
    return true;
  }
  if (city && PRICING.metroCities.some(
    (c) => c.toLowerCase() === city.toLowerCase(),
  )) {
    return true;
  }
  return false;
}

/** Pickup fee in ZAR cents. R99 metro, R149 non-metro. */
export function getPickupFee(province?: string, city?: string): number {
  return isMetroArea(province, city)
    ? PRICING.pickupFee.metro
    : PRICING.pickupFee.nonMetro;
}

/** Return-delivery fee in ZAR cents. R99 metro, R149 non-metro. */
export function getDeliveryFee(province?: string, city?: string): number {
  return isMetroArea(province, city)
    ? PRICING.deliveryFee.metro
    : PRICING.deliveryFee.nonMetro;
}

/** Build the full quote breakdown from components. */
export function buildQuoteBreakdown(
  repairCost: number,
  pickupFee: number,
  deliveryFee: number,
  aiAssessed: boolean,
): QuoteBreakdown {
  const totalCost = repairCost + pickupFee + deliveryFee;
  const depositAmount = Math.ceil(totalCost / 2);
  return {
    repairCost,
    pickupFee,
    deliveryFee,
    totalCost,
    depositAmount,
    remainingAmount: totalCost - depositAmount,
    pickupRequired: pickupFee > 0,
    aiAssessed,
  };
}

export interface QuoteBreakdown {
  repairCost: number;
  pickupFee: number;
  deliveryFee: number;
  totalCost: number;
  depositAmount: number;
  remainingAmount: number;
  pickupRequired: boolean;
  aiAssessed: boolean;
}
