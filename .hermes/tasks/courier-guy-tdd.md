# Task: Courier Guy Locker Deep Module — TDD

## Project Context
KitFix 2.0 at `/root/kitfix-2.0` — Next.js 16 App Router, Drizzle/Neon, Better Auth, Polar.sh, Tailwind 4.
AGENTS.md in project root has full structure and architecture docs.

## Role
You are implementing a deep module: Courier Guy Locker API client using strict TDD (Matt Pocock TDD skill).

## About TDD
Follow RED → GREEN → REFACTOR. One test at a time. Write ONE test, make it pass, then write the next.
Tests must verify behavior through public interfaces, not implementation details.
DO NOT write all tests first, then all implementation (horizontal slicing). Write one test, implement, repeat.

## What to Build

### 1. Types (`lib/courier/types.ts`)
```typescript
// Locker location
export interface Locker {
  id: string;
  name: string;
  address: string;
  suburb: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
  hours: string;
}

// Shipping modes
export type ShippingMode = 'L2L' | 'D2D' | 'D2L' | 'L2D';

// Rate request
export interface RateRequest {
  fromPostalCode: string;
  toPostalCode: string;
  mode: ShippingMode;
  weightKg: number;
  heightCm: number;
  widthCm: number;
  lengthCm: number;
}

// Rate response
export interface Rate {
  mode: ShippingMode;
  amountCents: number;
  estimatedDays: number;
  description: string;
}

export interface RateResponse {
  rates: Rate[];
}

// Shipment creation
export interface ShipmentRequest {
  fromName: string;
  fromPhone: string;
  fromLockerId?: string;
  fromAddress?: string;
  fromPostalCode: string;
  toName: string;
  toPhone: string;
  toLockerId?: string;
  toAddress?: string;
  toPostalCode: string;
  mode: ShippingMode;
  weightKg: number;
  dimensions: { height: number; width: number; length: number };
  description: string;
  reference: string;
}

export interface ShipmentResponse {
  id: string;
  barcode: string;
  status: string;
  labelUrl?: string;
  trackingUrl?: string;
}

// Tracking
export interface TrackingEvent {
  timestamp: string;
  location: string;
  status: string;
  description: string;
}

export interface TrackingResponse {
  barcode: string;
  status: string;
  events: TrackingEvent[];
  estimatedDelivery?: string;
}
```

### 2. HTTP Client (`lib/courier/client.ts`)
- Base URL: `https://wqvdmjybt6.execute-api.af-south-1.amazonaws.com/`
- Auth: API key from `TCG_API_KEY` env var
- Methods: `getLockers()`, `getRates(request)`, `createShipment(request)`, `getTracking(barcode)`, `getLabelUrl(shipmentId)`
- All methods return typed promises
- Internal: simple fetch wrapper with error handling, timeout, retry logic

### 3. Tests (`lib/courier/__tests__/client.test.ts`)
Use vitest (already configured). Mock the HTTP layer — don't call the real API.
Test behaviors in this order (vertical slices):
1. `getLockers()` returns parsed locker array
2. `getRates()` sends correct payload and returns RateResponse
3. `getRates()` handles API error gracefully (throws typed error)
4. `createShipment()` sends correct payload for L2L mode
5. `createShipment()` sends correct payload for D2D mode (no lockerId, has address)
6. `getTracking()` returns parsed tracking events
7. `getLabelUrl()` returns the label PDF URL
8. HTTP timeout triggers retry (at least 1 retry)
9. Missing API key throws meaningful error

### 4. Barrel export (`lib/courier/index.ts`)
Export everything from types and client.

## Tech Stack
- **Runtime:** Node.js 22 (CommonJS/ESM via Next.js)
- **Test framework:** Vitest (v4.0.18)
- **Pattern:** Deep module pattern — small public interface, rich internal logic
- **Money:** All monetary values in ZAR cents (integers)

## Constraints
- NO actual API calls in tests — mock `fetch` or use vitest's `vi.fn()`
- Test file must be at `lib/courier/__tests__/client.test.ts`
- Run `npm run test:run` to verify after each implementation cycle
- Run `npx next build` at the end to ensure no build breaks
