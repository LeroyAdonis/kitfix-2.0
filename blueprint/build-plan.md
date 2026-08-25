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

- [ ] 12. **Admin store** - product/inventory management for the admin dashboard (see `.hermes/tasks/` plans)
- [ ] 13. **Checkout & orders flow** - end-to-end checkout experience for repair services
- [ ] 14. **Courier integration** - integrate with a SA courier service for kit pickup and delivery
- [ ] 15. **Ecommerce storefront** - browseable product/service catalog with cart
- [ ] 16. **Storefront UI pages** - additional pages for the ecommerce storefront
- [ ] 17. **Design phase 2 pages** - additional page designs beyond the landing page (pricing details, about, contact)
- [ ] 18. **Repair-flow courier** - end-to-end repair flow including courier pickup/dropoff scheduling
