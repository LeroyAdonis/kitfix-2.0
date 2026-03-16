# AI-Conditional Pickup & 50% Deposit Flow — KitFix 2.0

**Date:** 2026-03-06
**Status:** Draft — Pending Approval
**Depends on:** `02-feature-specifications.md` (14-state pipeline, payment milestones, pickup/delivery)
**Depends on:** `2026-03-04-quote-workflow-design.md` (quote accept/reject flow)

---

## 1. Problem Statement

The current feature spec (`02-feature-specifications.md`) treats all repair submissions identically — every quote includes pickup + delivery fees, and every flow goes through `pickup_scheduled`. In practice, the customer experience should differ based on whether AI damage analysis was performed:

- **With AI analysis**: The admin has a confident remote assessment (damage type, severity, repairability, estimated cost range). A quote can be sent purely from photos + AI. No mandatory courier pickup is needed at the quoting stage — the customer may choose to drop off the jersey in person or arrange their own delivery.
- **Without AI analysis**: The admin has only photos and a text description — no machine-assessed severity or cost range. Physical inspection is required to give an accurate quote. A courier pickup **must** be arranged, and the pickup charge is added to the quote.

In **both** cases, when the customer accepts the quote, a **50% deposit** is required before any repair work begins. This is standard practice in South Africa's repair services market (30–50% deposits are the norm per industry convention and are permissible under the Consumer Protection Act, Section 17, provided the deposit is "reasonable").

### What This Design Adds (Not Covered Elsewhere)

| Concept | Existing Spec Coverage | This Design |
|---------|----------------------|-------------|
| 50% deposit on acceptance | ✅ Section 5.3 "Payment Milestones" | Refines trigger logic only |
| Pickup/delivery fees | ✅ Always included in `QuoteBreakdown` | **Conditional** — only when AI is skipped |
| Pickup address collection | ✅ At `quote_accepted` stage | **Earlier** — at `reviewed` stage when AI is skipped |
| AI-skip detection | ❌ Not addressed | **New** — `aiDamageAssessment IS NULL` check |
| Notification + email at `quote_sent` | ✅ Basic notification | **Enhanced** with pickup charge breakdown |
| Quote breakdown UI | ✅ Shows pickup/delivery fees always | **Conditional** layout based on AI path |

---

## 2. South African Market Context

### Deposit Regulations (Consumer Protection Act)

- **Section 15**: Suppliers must provide an estimate before charging. Additional costs require further authorization.
- **Section 17**: Reasonable deposits are permitted for advance bookings/services. The CPA does not define exact amounts — "reasonable" is the standard. 50% is well within industry norms for repair services.
- **Section 65**: Deposits must be held accountably and any balance returned when the obligation ends.
- **Key principle**: Deposits must not be punitive. On cancellation, only actual costs/losses may be retained.

**Implication for KitFix**: A 50% deposit is legally sound. On cancellation pre-repair, full refund of the deposit is required. Post-pickup, courier fees may be deducted (already specified in Section 5.6 of the feature spec).

### Courier Pricing (2025–2026 Market Rates)

| Delivery Type | Metro-to-Metro | Metro-to-Rural | Locker Drop-off | Express |
|---------------|----------------|----------------|-----------------|---------|
| Up to 2 kg satchel | R75 – R130 | R120 – R190 | R60 – R100 | R120 – R210 |

**Recommended KitFix pickup fee**: **R99** fixed flat rate (metro), **R149** (non-metro). These are competitive within the R75–R130 metro and R120–R190 rural ranges. Flat-rate simplifies UX and quoting.

### Key Courier Partners (from `03-delivery-partnership-strategy.md`)

- **Pargo**: R35–R55 locker, R65–R95 door-to-door. No minimum. REST API. Best for Phase 1.
- **The Courier Guy**: National coverage, ShipLogic API. Best for scale.
- **Uber Connect**: Same-day metro only. Good for rush orders.

---

## 3. Proposed Approach — AI-Conditional Branching

### Design Decision: Single approach recommended

After evaluating three approaches, a single recommended approach emerged:

#### Approach A: Conditional Quote Composition (Recommended)

The quote breakdown is **dynamically composed** based on whether `aiDamageAssessment` is present on the repair request. The status pipeline remains unchanged (no new states). The branching is purely in the **quote composition logic** and **UI rendering**.

```
Customer submits repair request
         │
         ├── WITH AI analysis (aiDamageAssessment IS NOT NULL)
         │   │
         │   ▼
         │   Admin reviews (has AI severity, repairability, cost range)
         │   │
         │   ▼
         │   sendQuoteAction:
         │     - repairCost = admin's estimate (informed by AI range)
         │     - pickupFee = R0 (customer drops off / arranges own delivery)
         │     - deliveryFee = standard delivery fee (for return)
         │     - totalCost = repairCost + deliveryFee
         │     - depositAmount = ceil(totalCost / 2)
         │   │
         │   ▼
         │   Notification + Email: "Your quote is ready — R{totalCost}"
         │   │
         │   ▼
         │   Customer accepts → 50% deposit via Polar.sh → pickup_scheduled
         │
         │
         └── WITHOUT AI analysis (aiDamageAssessment IS NULL)
             │
             ▼
             Admin reviews (photos + text only, no AI confidence)
             │
             ▼
             Admin flags: "Physical inspection required"
             │
             ▼
             Customer prompted for pickup address (modal/form)
             │
             ▼
             sendQuoteAction:
               - repairCost = admin's estimate (less confident, may be range)
               - pickupFee = R99 (metro) / R149 (non-metro)
               - deliveryFee = standard delivery fee
               - totalCost = repairCost + pickupFee + deliveryFee
               - depositAmount = ceil(totalCost / 2)
             │
             ▼
             Notification + Email: 
               "Your quote is ready — R{totalCost}"
               "Includes R{pickupFee} pickup charge for physical inspection"
             │
             ▼
             Customer accepts → 50% deposit via Polar.sh → pickup_scheduled
```

**Why this approach?**
- No schema pipeline changes needed (14-state pipeline remains intact)
- Minimal DB changes (add `pickupRequired` boolean + `pickupFee` column)
- Clear UX distinction between the two paths
- Aligns with the existing `QuoteBreakdown` interface

#### Approaches Considered but Rejected

**Approach B: Separate Status States** — Add `awaiting_pickup_address` state between `reviewed` and `quote_sent` for non-AI submissions. Rejected because it adds pipeline complexity for what is fundamentally a data-collection concern, not a status transition.

**Approach C: Mandatory Pickup Always** — Keep the existing spec as-is (pickup always included). Rejected because it penalises customers who used AI analysis with unnecessary pickup fees, and doesn't reflect the operational reality that AI-assessed repairs can often be quoted remotely.

---

## 4. Detailed Design

### 4.1 Schema Changes

#### On `repairRequests` table

```typescript
// New columns
pickupRequired: boolean("pickup_required").notNull().default(false),
pickupFee: integer("pickup_fee").default(0),   // ZAR cents (e.g., 9900 = R99)
deliveryFee: integer("delivery_fee").default(0), // ZAR cents
```

**Logic**: When admin sends a quote and `aiDamageAssessment IS NULL`, set `pickupRequired = true` and populate `pickupFee` based on the customer's province (metro vs non-metro lookup).

#### On `payments` table

No changes. The existing `paymentMilestone` field (`"deposit"` | `"final"`) from the feature spec is sufficient. The `amount` field stores the deposit amount (50% of totalCost including any pickup fee).

### 4.2 Updated QuoteBreakdown Interface

```typescript
interface QuoteBreakdown {
  repairCost: number;        // estimatedCost from admin (ZAR cents)
  pickupFee: number;         // 0 if AI was used, else R99/R149 (ZAR cents)
  deliveryFee: number;       // Standard return delivery fee (ZAR cents)
  totalCost: number;         // repairCost + pickupFee + deliveryFee
  depositAmount: number;     // Math.ceil(totalCost / 2)
  remainingAmount: number;   // totalCost - depositAmount
  pickupRequired: boolean;   // true if AI was skipped
  aiAssessed: boolean;       // true if aiDamageAssessment is present
}
```

### 4.3 Pickup Fee Configuration

```typescript
// lib/config/pricing.ts (new file)
export const PRICING = {
  pickupFee: {
    metro: 9900,       // R99.00 in cents
    nonMetro: 14900,   // R149.00 in cents
  },
  deliveryFee: {
    metro: 9900,       // R99.00 in cents
    nonMetro: 14900,   // R149.00 in cents
  },
  metroProvinces: ["Gauteng"], // Provinces considered metro rate
  metroCities: [
    "Johannesburg", "Pretoria", "Cape Town", "Durban",
    "Port Elizabeth", "Bloemfontein",
  ],
} as const;
```

**Note**: Flat-rate pricing is Phase 1. Dynamic courier API pricing can replace this in Phase 2 (per Open Question #3 in the feature spec).

### 4.4 Admin Review Flow — AI-Skip Detection

When admin opens a repair request in `reviewed` status:

```
┌─────────────────────────────────────────────────────────┐
│  Repair #KF-2024-0042                                   │
│                                                         │
│  ┌── AI Assessment ──────────────────────────────────┐  │
│  │  ⚠️ No AI analysis available                      │  │
│  │  Customer skipped AI damage assessment.           │  │
│  │  Physical inspection required before quoting.     │  │
│  │                                                   │  │
│  │  [Pickup will be arranged — fee added to quote]   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  OR (if AI was used):                                   │
│                                                         │
│  ┌── AI Assessment ──────────────────────────────────┐  │
│  │  ✅ AI Analysis Complete                          │  │
│  │  Damage: Tear (Moderate severity)                 │  │
│  │  Repairability: Moderate                          │  │
│  │  Suggested range: R200 – R400                     │  │
│  │  Confidence: 87%                                  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Repair Cost Estimate: [R ______]                       │
│  Admin Notes: [__________________________]              │
│                                                         │
│  [Send Quote]                                           │
└─────────────────────────────────────────────────────────┘
```

### 4.5 Customer Quote View — Conditional Breakdown

**When AI was used (no pickup fee):**

```
┌─────────────────────────────┐
│  Your Repair Quote          │
│                             │
│  Repair Cost:     R 300.00  │
│  Delivery Fee:    R  99.00  │
│  ─────────────────────────  │
│  Total:           R 399.00  │
│                             │
│  Due Now (50%):   R 200.00  │
│  Due on Complete: R 199.00  │
│                             │
│  [Accept Quote] [Reject]    │
└─────────────────────────────┘
```

**When AI was skipped (pickup fee included):**

```
┌──────────────────────────────────────────┐
│  Your Repair Quote                       │
│                                          │
│  Repair Cost:        R 300.00            │
│  Pickup Fee:         R  99.00  ← NEW    │
│  Delivery Fee:       R  99.00            │
│  ──────────────────────────────────────  │
│  Total:              R 498.00            │
│                                          │
│  Due Now (50%):      R 249.00            │
│  Due on Complete:    R 249.00            │
│                                          │
│  ℹ️ Pickup required: We need to collect  │
│  your jersey for in-person inspection.   │
│  A courier will be arranged to your      │
│  address after payment.                  │
│                                          │
│  📍 Pickup Address:                      │
│  [Street ____________________________]   │
│  [Suburb ____________] [City ________]   │
│  [Province ▼________] [Code ________]   │
│  [Contact Name ______________________]   │
│  [Contact Phone _____________________]   │
│  [Special Instructions _______________]  │
│                                          │
│  [Accept & Pay Deposit]  [Reject Quote]  │
└──────────────────────────────────────────┘
```

**Key UX difference**: When AI is skipped, the pickup address form is embedded in the quote acceptance flow (not deferred to `quote_accepted` as in the base feature spec). The customer must provide the address before they can accept.

### 4.6 Pickup Address Collection Timing

| Scenario | When Address is Collected | Why |
|----------|--------------------------|-----|
| AI used | At `quote_accepted` stage (existing spec) | Pickup is a logistics step, not an inspection requirement |
| AI skipped | At `quote_sent` stage (within quote review card) | Admin needs to know where to send the courier; address is part of the quoting decision |

### 4.7 sendQuoteAction — Enhanced

```typescript
// actions/quotes.ts — enhanced sendQuoteAction
async function sendQuoteAction(input: {
  repairId: string;
  estimatedCost: number;     // ZAR cents (repair work only)
  adminNotes?: string;
}) {
  const repair = await getRepairById(input.repairId);
  
  const aiSkipped = repair.aiDamageAssessment === null;
  const pickupRequired = aiSkipped;
  
  // Determine fees
  const pickupFee = pickupRequired
    ? getPickupFee(repair.shippingAddress?.province)  // R99 metro / R149 non-metro
    : 0;
  const deliveryFee = getDeliveryFee(repair.shippingAddress?.province);
  
  // Update repair request
  await updateRepair(input.repairId, {
    estimatedCost: input.estimatedCost,
    pickupRequired,
    pickupFee,
    deliveryFee,
    adminNotes: input.adminNotes,
    currentStatus: "quote_sent",
  });
  
  // Calculate quote breakdown for notifications
  const totalCost = input.estimatedCost + pickupFee + deliveryFee;
  const depositAmount = Math.ceil(totalCost / 2);
  
  // Send notification + email
  await createNotification({
    userId: repair.customerId,
    type: "status_update",
    title: "Your repair quote is ready",
    message: pickupRequired
      ? `Estimated total: R${(totalCost / 100).toFixed(2)} (includes R${(pickupFee / 100).toFixed(2)} pickup fee for physical inspection). 50% deposit of R${(depositAmount / 100).toFixed(2)} required to proceed.`
      : `Estimated total: R${(totalCost / 100).toFixed(2)}. 50% deposit of R${(depositAmount / 100).toFixed(2)} required to proceed.`,
    repairRequestId: input.repairId,
  });
  
  await sendQuoteReadyEmail({
    to: repair.customer.email,
    customerName: repair.customer.name,
    repairId: input.repairId,
    repairCost: input.estimatedCost,
    pickupFee,
    deliveryFee,
    totalCost,
    depositAmount,
    pickupRequired,
    adminNotes: input.adminNotes,
  });
}
```

### 4.8 acceptQuoteAction — Enhanced with Address Validation

```typescript
async function acceptQuoteAction(input: {
  repairId: string;
  pickupAddress?: ShippingAddress;  // Required when pickupRequired === true
}) {
  const repair = await getRepairById(input.repairId);
  
  // Validate pickup address if required
  if (repair.pickupRequired && !input.pickupAddress) {
    return { success: false, error: "Pickup address is required for this repair." };
  }
  
  // Store shipping address
  if (input.pickupAddress) {
    await updateRepair(input.repairId, {
      shippingAddress: input.pickupAddress,
    });
  }
  
  // Calculate 50% deposit
  const totalCost = repair.estimatedCost + (repair.pickupFee ?? 0) + (repair.deliveryFee ?? 0);
  const depositAmount = Math.ceil(totalCost / 2);
  
  // Initiate Polar.sh checkout for 50% deposit
  const checkout = await initiateDepositCheckout({
    repairId: input.repairId,
    customerId: repair.customerId,
    amount: depositAmount,
    description: `50% deposit for repair #${input.repairId}`,
  });
  
  // Update status
  await updateRepair(input.repairId, {
    currentStatus: "quote_accepted",
  });
  
  // Notify admin
  await createNotification({
    userId: "all_admins",
    type: "system",
    title: "Quote accepted",
    message: `Customer accepted quote for repair #${input.repairId}. Deposit payment pending.`,
    repairRequestId: input.repairId,
  });
  
  return { success: true, data: { checkoutUrl: checkout.url } };
}
```

### 4.9 Notification & Email Matrix

| Event | Condition | Recipient | In-App | Email | Message Content |
|-------|-----------|-----------|--------|-------|-----------------|
| Quote sent (AI used) | `aiDamageAssessment` present | Customer | ✅ | ✅ | "Your quote is ready — R{total}. 50% deposit required." |
| Quote sent (AI skipped) | `aiDamageAssessment` null | Customer | ✅ | ✅ | "Your quote is ready — R{total} (includes R{pickup} pickup fee). Please provide your pickup address and pay 50% deposit." |
| Quote accepted | Always | All admins | ✅ | ❌ | "Customer accepted quote for #{id}. Deposit pending." |
| Deposit payment success | Always | Customer | ✅ | ✅ | "Payment of R{deposit} confirmed! We're scheduling your pickup." |
| Deposit payment success | Always | All admins | ✅ | ❌ | "Deposit received for #{id}. Ready for pickup scheduling." |
| Pickup scheduled | `pickupRequired` true | Customer | ✅ | ✅ | "Your courier pickup is scheduled for {date}. A driver will collect your jersey from {address}." |

### 4.10 Email Template — Quote Ready (Enhanced)

```
Subject: Your KitFix Repair Quote is Ready — R{totalCost}

Hi {customerName},

Great news! We've reviewed your jersey repair request and prepared your quote.

QUOTE BREAKDOWN
─────────────────────────────
Repair Cost:       R {repairCost}
{if pickupRequired}
Pickup Fee:        R {pickupFee}   ← Physical inspection required
{/if}
Delivery Fee:      R {deliveryFee}
─────────────────────────────
Total:             R {totalCost}

PAYMENT
─────────────────────────────
50% Deposit (due now):  R {depositAmount}
Balance (after repair): R {remainingAmount}

{if pickupRequired}
📍 PICKUP REQUIRED
Since we need to physically inspect your jersey, a courier pickup
will be arranged to collect it from your address. Please provide
your pickup address when you accept the quote.
{/if}

{if adminNotes}
REPAIR NOTES
{adminNotes}
{/if}

[Accept Quote & Pay Deposit →]

This quote is valid until you decide. If you have questions,
reply to this email.

Cheers,
The KitFix Team
```

---

## 5. Flow Diagrams

### 5.1 Complete Conditional Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    REPAIR SUBMISSION                             │
│                                                                  │
│  Customer fills form → uploads photos → [AI Analysis?]           │
│                                           │         │            │
│                                          YES        NO           │
│                                           │         │            │
│                                     AI analyzes   Skipped        │
│                                     photos         │            │
│                                           │         │            │
│                              aiDamageAssessment    null          │
│                                           │         │            │
│                                           ▼         ▼            │
│                                    ┌─────────────────┐           │
│                                    │    submitted     │           │
│                                    └────────┬────────┘           │
│                                             │                    │
│                                      Admin reviews               │
│                                             │                    │
│                                    ┌────────┴────────┐           │
│                                    │    reviewed      │           │
│                                    └────────┬────────┘           │
│                                             │                    │
│                          ┌──────────────────┴──────────────┐     │
│                          │                                 │     │
│                    AI PRESENT                         AI NULL    │
│                          │                                 │     │
│                    pickupFee = R0                pickupFee = R99  │
│                    pickupRequired = false        pickupRequired = true│
│                          │                                 │     │
│                          └──────────┬──────────────────────┘     │
│                                     │                            │
│                            ┌────────┴────────┐                   │
│                            │   quote_sent     │                  │
│                            │                  │                  │
│                            │ Notification ✅  │                  │
│                            │ Email ✅         │                  │
│                            └────────┬────────┘                   │
│                                     │                            │
│                              Customer accepts                    │
│                         (+ pickup address if required)           │
│                                     │                            │
│                           ┌─────────┴─────────┐                 │
│                           │  quote_accepted    │                 │
│                           │                    │                 │
│                           │  50% DEPOSIT       │                 │
│                           │  via Polar.sh      │                 │
│                           └─────────┬─────────┘                 │
│                                     │                            │
│                             Deposit confirmed                    │
│                           (Polar webhook)                        │
│                                     │                            │
│                          ┌──────────┴──────────┐                 │
│                          │  pickup_scheduled    │                 │
│                          └──────────┬──────────┘                 │
│                                     │                            │
│                              ... standard pipeline ...           │
│                          picked_up → received → in_repair        │
│                          → quality_check → 50% final → shipped   │
│                          → complete                              │
└──────────────────────────────────────────────────────────────────┘
```

### 5.2 Payment Split Visualization

```
WITH AI (no pickup fee):
┌──────────────────────────────────────┐
│ Repair: R300 + Delivery: R99 = R399  │
│ ┌─────────────────┬────────────────┐ │
│ │  Deposit: R200  │  Final: R199   │ │
│ │  (at accept)    │  (at QC pass)  │ │
│ └─────────────────┴────────────────┘ │
└──────────────────────────────────────┘

WITHOUT AI (pickup fee added):
┌──────────────────────────────────────────────────┐
│ Repair: R300 + Pickup: R99 + Delivery: R99 = R498│
│ ┌──────────────────────┬───────────────────────┐ │
│ │  Deposit: R249       │  Final: R249          │ │
│ │  (at accept)         │  (at QC pass)         │ │
│ └──────────────────────┴───────────────────────┘ │
└──────────────────────────────────────────────────┘
```

---

## 6. Edge Cases & Error Handling

### 6.1 Customer Adds AI Analysis After Submission

If a customer initially skips AI but later runs the AI analyzer (before quote is sent):
- **Behavior**: If `aiDamageAssessment` is populated before admin sends the quote, the flow treats it as "AI used" (no pickup fee).
- **Implementation**: Check `aiDamageAssessment` at `sendQuoteAction` time, not at submission time.

### 6.2 Admin Overrides Pickup Requirement

Admin should be able to toggle `pickupRequired` regardless of AI status:
- Customer used AI but admin wants physical inspection → admin can enable pickup
- Customer skipped AI but admin is confident from photos → admin can disable pickup

UI: A toggle switch on the admin quote form: "Require physical pickup? [Yes/No]" — defaulting to `true` when AI is skipped, `false` when AI is present.

### 6.3 Invalid or Incomplete Pickup Address

- **Validation**: Province must be a valid SA province. Postal code must be 4 digits. Contact phone must start with `+27` or `0`.
- **Zod schema**: Extend existing `shippingAddressSchema` with stricter SA-specific validation.
- **UX**: Inline validation errors. Cannot submit/accept without valid address (when pickup is required).

### 6.4 Pickup Fee for Rural/Non-Metro Addresses

- **Metro detection**: Match `city` or `province` against `PRICING.metroCities` / `PRICING.metroProvinces`.
- **Fallback**: If city is not recognized, default to non-metro rate (R149).
- **Transparency**: Show the fee determination in the quote ("Pickup fee based on your location in {city}").

### 6.5 Payment Failure at Deposit Stage

Already handled by the feature spec (Section 5.3): customer stays in `quote_accepted`, can retry. After 7 days without payment, admin is notified for manual follow-up.

### 6.6 Cancellation After Deposit, Before Pickup

Already handled by the feature spec (Section 5.6): full 50% deposit refund if cancelled before pickup is scheduled.

---

## 7. Implementation Summary

### New/Modified Files

| File | Change |
|------|--------|
| `lib/db/schema.ts` | Add `pickupRequired`, `pickupFee`, `deliveryFee` to `repairRequests` |
| `lib/config/pricing.ts` | New file — pickup/delivery fee constants and metro detection |
| `lib/validators/repair.ts` | Add pickup address validation with SA-specific rules |
| `actions/quotes.ts` | Enhance `sendQuoteAction` with conditional pickup logic |
| `actions/quotes.ts` | Enhance `acceptQuoteAction` with address + deposit flow |
| `lib/email-templates.ts` | New `sendQuoteReadyEmail` template with conditional pickup section |
| `components/repair/quote-review-card.tsx` | Conditional UI: show pickup address form when `pickupRequired` |
| `app/(admin)/admin/requests/[id]/page.tsx` | Show AI-skip warning banner + pickup toggle |
| `drizzle/` | New migration for `pickupRequired`, `pickupFee`, `deliveryFee` columns |

### No Changes Required To

- Status pipeline (14 states remain as specified)
- Payment table schema
- Notification table schema
- Polar.sh integration (uses existing checkout flow, just with different amounts)
- Courier integration architecture

---

## 8. Open Questions

| # | Question | Impact | Default Assumption |
|---|----------|--------|--------------------|
| 1 | Should pickup fee be flat-rate or dynamic from courier API? | Pricing accuracy | Flat-rate (Phase 1), dynamic (Phase 2) |
| 2 | Can admin override pickup requirement regardless of AI status? | Admin flexibility | Yes — toggle on quote form |
| 3 | Should non-metro detection be city-based or postal-code-based? | Fee calculation | City-based with fallback to non-metro |
| 4 | Should the deposit email include a direct link to Polar checkout? | Conversion rate | Yes — "Accept & Pay" button links to checkout |
| 5 | Should the customer be able to add AI analysis after submission to avoid pickup fee? | UX fairness | Yes — check AI at sendQuote time, not submit time |
