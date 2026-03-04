# Quote Workflow Design — KitFix 2.0

**Date:** 2026-03-04
**Status:** Approved
**Approach:** New status stages (Approach A — linear pipeline extension)

## Overview

Add a quote/estimate approval stage to the repair pipeline so customers can review, accept, or request re-quotes before repair work begins. Quotes are informed by both AI damage assessment and admin review. All prices in ZAR.

## Status Pipeline

**Before:** `submitted → reviewed → in_repair → quality_check → shipped`

**After:** `submitted → reviewed → quote_sent → quote_accepted → in_repair → quality_check → shipped`

### Transitions
- `reviewed → quote_sent` — Admin sets `estimatedCost`, adds notes, clicks "Send Quote"
- `quote_sent → quote_accepted` — Customer accepts quote
- `quote_sent → reviewed` — Customer requests re-quote (with reason)
- `reviewed → quote_sent` — Admin revises and re-sends quote

## Schema Changes

### Enum: `repairStatusEnum`
Add two new values: `quote_sent`, `quote_accepted` (between `reviewed` and `in_repair`).

### Table: `repairRequests`
Add column: `quoteDeclineReason` (text, nullable) — stores customer's reason when requesting a re-quote.

Existing fields used: `estimatedCost` (integer), `finalCost` (integer), `adminNotes` (text).

## Admin Side

**Page:** `/admin/requests/[id]`

When repair is `reviewed`:
- Display AI assessment summary + uploaded photos
- `estimatedCost` input field (ZAR, already exists)
- `adminNotes` textarea (already exists)
- **"Send Quote" button** → `updateRepairStatusAction` moves to `quote_sent`, triggers customer notification + email

When repair returns to `reviewed` (re-quote requested):
- Display `quoteDeclineReason` from customer
- Admin adjusts estimate and re-sends

## Customer Side

**Page:** `/repairs/[id]`

When repair status is `quote_sent`, display a **Quote Review Card**:
- Jersey details (type, team, damage type from AI)
- Uploaded photos
- Quoted price: **R {estimatedCost}** (ZAR formatted)
- Admin notes (if any)
- **"Accept Quote"** button → server action → status `quote_accepted`
- **"Request Re-quote"** button → modal with reason textarea → server action → status back to `reviewed`, store `quoteDeclineReason`, notify admin

## Notifications

| Event | Recipient | In-App | Email |
|-------|-----------|--------|-------|
| Quote sent | Customer | ✅ "Your repair quote is ready — R{amount}" | ✅ `sendEstimateReadyEmail` (exists) |
| Quote accepted | Admin | ✅ "Customer accepted quote for repair #{id}" | ❌ |
| Re-quote requested | Admin | ✅ "Customer requested re-quote: {reason}" | ❌ |

## Server Actions

### New actions
- `acceptQuoteAction(repairId)` — Customer accepts quote, moves to `quote_accepted`
- `declineQuoteAction(repairId, reason)` — Customer requests re-quote, moves to `reviewed`, stores reason
- `sendQuoteAction(repairId, estimatedCost, adminNotes?)` — Admin sends quote, moves to `quote_sent`, triggers notifications

### Modified actions
- `updateRepairStatusAction` — Allow new status values in validation

## Test Seed Data

Script: `scripts/seed.ts`

### Users
- **Admin:** `admin@kitfix.co.za` / `KitFix2024!` (admin role)
- **Customer:** `customer@test.co.za` / `Test1234!`

### Repair Requests (6 total)
1. Status `submitted` — New, no quote
2. Status `reviewed` — AI assessed, ready for quoting
3. Status `quote_sent` — Awaiting customer approval, R450
4. Status `quote_accepted` — Approved, repair in progress
5. Status `shipped` — Completed, R500 final cost
6. Status `reviewed` + `quoteDeclineReason` — Re-quote requested

## Out of Scope
- Multi-currency (ZAR only)
- Payment collection at quote acceptance (handled separately via Polar.sh)
- Quote expiry/time limits
- Automated pricing engine
