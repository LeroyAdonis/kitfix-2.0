# Build Plan

## Shipped (MVP)

- [x] 1. **Landing page** - hero with GSAP animation, services overview, pricing tiers, stats, how-it-works steps, WhatsApp CTA, footer
- [x] 2. **Customer auth** - email/password sign-in and sign-up via Better Auth + Convex, protected routes
- [x] 3. **Repair job submission** - `/repair/new`: description, optional phone, photo upload (max 5, Convex file storage), AI damage analysis (NVIDIA vision), submit job
- [x] 4. **Customer job tracking** - `/my-jobs`: list of user's jobs with status (new/in_repair/ready/done)
- [x] 5. **Admin dashboard** - `/admin`: kanban board with job columns by status, cookie-based auth
- [x] 6. **Admin job detail** - `/admin/jobs/[id]`: AI assessment panel, customer info, photo gallery, status management, admin notes
- [x] 7. **Quote management** - AI estimate at creation, admin override (resets to estimate), customer confirmation, quote history audit trail
- [x] 8. **Payment integration** - Paystack checkout (initialize, webhook, verify), post-payment page
- [x] 9. **WhatsApp/Telegram concierge** - `/api/concierge` proxy for legacy messaging path (create-job, get-jobs, get-job, update-status)
- [x] 10. **PWA** - manual service worker (`public/sw.js`) + manifest.json
- [x] 11. **Design system** - "Repair Sheet" language: pitch green palette, stitch gold accent, Archivo Black / Space Grotesk / IBM Plex Mono, stitch seam divider, sharp corners

## Post-MVP (Roadmap)

- [x] 12. **Admin store** - product/inventory management for the admin dashboard
  - [x] 12a. Product/inventory management — shipped (archive: `blueprint/history/features/12a-admin-store.md`)
  - [ ] 12b. Order management — deferred until checkout feature #13
- [ ] 13. **Checkout & orders flow** - end-to-end checkout experience for repair services
- [ ] 14. **Courier integration** - integrate with a SA courier service for kit pickup and delivery — **DEFERRED**, see [Scope decisions](#scope-decisions)
- [x] 15. ~~**Ecommerce storefront** - browseable product/service catalog with cart~~ — **CUT**, see [Scope decisions](#scope-decisions)
- [x] 16. ~~**Storefront UI pages** - additional pages for the ecommerce storefront~~ — **CUT**, see [Scope decisions](#scope-decisions)
- [ ] 17. **Design phase 2 pages** - additional page designs beyond the landing page (pricing details, about, contact)
- [ ] 18. **Repair-flow courier** - end-to-end repair flow including courier pickup/dropoff scheduling — **DEFERRED**, see [Scope decisions](#scope-decisions)

## Scope decisions

Decisions that are settled and should not be re-litigated. Newest first. A cut item may be
reopened only by a new decision recorded here.

### 2026-10-22 — Cut the ecommerce storefront; defer the courier API (DIG-20)

**CUT — 15. Ecommerce storefront, 16. Storefront UI pages.** KitFix repairs kit for clubs and
schools; it does not sell products. A product catalogue plus cart is a second business (stock,
shipping, returns, tax) and none of it is needed to earn the first revenue, which comes from repair
jobs already flowing through `/repair/new` → quote → Paystack checkout. These items are removed from
the roadmap, not parked on it. Reopening requires a deliberate decision to start a retail business —
not a side effect of another feature.

**DEFERRED — 14. Courier integration, 18. Repair-flow courier.** At launch volume the courier is
booked by hand: the admin already sees every job, its status and its customer contact details, so a
manual booking is one step in a workflow that already exists. Integrating a courier API before there
is volume is building for scale we do not have — it fixes an operational bottleneck that has not
happened yet.

**Reopen trigger (14 and 18):** manual booking has actually become the constraint. Concretely, when
**either** of these is true:

- sustained volume above ~20 live jobs per week makes hand-booking take longer than the repair work
  itself, **or**
- more than a handful of jobs per month are lost or delayed because a pickup could not be arranged
  fast enough.

Until one of those is measured, 14/18 stay deferred. `repair-flow-courier` stays unbuilt.

**KEEP — 13. Checkout & orders flow,** because the payment webhook does lose information the
business may need. Evidence and the specific gap are recorded on DIG-20: the webhook persists job →
paid + Paystack reference + server receipt time, but **not the amount actually charged**, and the
amount can only be inferred from `jobs.quote`, which admin override can still change. Who paid,
reference and when are recoverable today. No schema change is made in this decision — it is recorded
as a follow-up, not implemented here.
