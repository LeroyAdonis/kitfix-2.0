# KitFix — Repair Flow & Courier Guy Integration

## Industry Standard Repair Pipeline

Based on professional repair service operations (device repair, automotive, textile restoration):

### Current 7-Stage Pipeline
```
submitted → reviewed → quote_sent → quote_accepted → in_repair → quality_check → shipped
```

### Enhanced 10-Stage Pipeline (with delivery + payments)
```
submitted → reviewed → quote_sent → quote_accepted → 
  → item_received → in_repair → quality_check → 
  → ready_for_shipment → shipped → delivered
```

### Key Additions
1. **item_received** — Physical jersey arrives at workshop. Separate from quote acceptance.
2. **ready_for_shipment** — Repair done, awaiting customer to select locker/address and pay remaining balance.
3. **delivered** — Customer confirms receipt (not just "shipped").

### Courier Guy Integration Points

| Flow Step | Courier Guy Action | API Endpoint |
|-----------|-------------------|--------------|
| Quote sent | Calculate shipping rates (L2L/D2D) | `POST /rates` |
| Item received | Create return shipment label | `POST /shipments` |
| Ready for shipment | Customer chooses locker/address | — |
| Shipped | Generate waybill, return tracking barcode | `GET /shipments/:id/label` |
| In transit | Track parcel status | `GET /tracking/parcel/:barcode` |
| Delivered | Confirm delivery | webhook/polling |

### Shipping Modes (SA Context)
| Mode | Cost | Best For |
|------|------|----------|
| **L2L** (Locker to Locker) | Cheapest | Metro customers near Pudo/The Courier Guy lockers |
| **D2L** (Door to Locker) | Medium | Customer ships from home to workshop locker |
| **L2D** (Locker to Door) | Medium | Workshop ships from locker to customer's door |
| **D2D** (Door to Door) | Most expensive | Rural / no locker nearby |

### Pricing Model
- Customer pays **outbound shipping** (to workshop) — calculated at quote
- Repair cost includes **return shipping** — built into quote
- Metro/non-metro detection: non-metro = R50 surcharge

## What to Build

### Phase A: Enhanced Repair Schema
- Add `item_received`, `ready_for_shipment`, `delivered` to repair status enum
- Add shipping fields to repair_requests table:
  - `shipping_mode` (L2L/D2D/D2L/L2D)
  - `outbound_locker_id` / `return_locker_id`
  - `outbound_tracking` / `return_tracking`
  - `outbound_label_url` / `return_label_url`
  - `shipping_rate_cents` / `shipping_surcharge_cents`
- Update seed data for new statuses
- Migration to add new columns

### Phase B: Courier Guy in Repair Flow
- **Submit Repair**: Add locker/address selection for drop-off
- **Quote**: Include shipping rates from Courier Guy API
- **Accept Quote**: Show total with shipping breakdown
- **Admin Ship**: Admin generates return label when repair is done
- **Track**: Customer sees tracking status + waybill download

### Phase C: Courier Guy in Checkout (E-commerce)
- **Cart → Checkout**: Choose L2L locker or D2D delivery
- **Shipping rates**: Fetch from Courier Guy API based on selected mode
- **Order**: Store shipping details, generate label on payment

## Files to Create/Modify

### New Files
- `lib/shipping/rates.ts` — Calculate shipping costs with metro detection
- `lib/shipping/lockers.ts` — Locker lookup and address formatting
- `components/repair/ShippingSelector.tsx` — Locker/address picker for repair flow
- `components/store/ShippingStep.tsx` — Shipping selection during checkout
- `app/api/webhooks/courier/route.ts` — Courier Guy tracking webhook

### Modified Files
- `lib/db/schema.ts` — New statuses + shipping columns
- `actions/repairs.ts` — Add shipping to quote/accept/create
- `actions/orders.ts` — Add shipping to order creation
- `actions/admin.ts` — Admin can generate labels
- `components/repair/QuoteBreakdown.tsx` — Show shipping costs
- `app/(store)/checkout/page.tsx` — Shipping step

## Technical Notes
- Courier Guy API key: `TCG_API_KEY` env var (currently missing from Vercel — add it)
- Metro areas: CPT, JHB, DUR, PTA, EL, BFN, etc.
- Non-metro surcharge: R50 (configurable in `lib/config/pricing.ts`)
- L2L is default mode for both repair and e-commerce
- Waybills are PDFs — link to download after generation
