import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-deep">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-lg font-display font-extrabold tracking-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-gold to-brand-gold-light text-xs text-text-inverse">
                ✦
              </span>
              Kit<span className="text-brand-gold">Fix</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-text-secondary leading-relaxed">
              South Africa&apos;s trusted jersey repair and customisation service. We bring your kit back to life.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Services</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-text-secondary transition-colors hover:text-text-primary">Jersey Repair</Link></li>
              <li><Link href="#" className="text-sm text-text-secondary transition-colors hover:text-text-primary">Customisation</Link></li>
              <li><Link href="#" className="text-sm text-text-secondary transition-colors hover:text-text-primary">Vintage Restoration</Link></li>
              <li><Link href="#" className="text-sm text-text-secondary transition-colors hover:text-text-primary">Bulk Team Orders</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Shop</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-text-secondary transition-colors hover:text-text-primary">All Jerseys</Link></li>
              <li><Link href="#" className="text-sm text-text-secondary transition-colors hover:text-text-primary">Soccer</Link></li>
              <li><Link href="#" className="text-sm text-text-secondary transition-colors hover:text-text-primary">Rugby</Link></li>
              <li><Link href="#" className="text-sm text-text-secondary transition-colors hover:text-text-primary">Custom Blanks</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Company</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-text-secondary transition-colors hover:text-text-primary">About Us</Link></li>
              <li><Link href="#" className="text-sm text-text-secondary transition-colors hover:text-text-primary">How It Works</Link></li>
              <li><Link href="#" className="text-sm text-text-secondary transition-colors hover:text-text-primary">Track Repair</Link></li>
              <li><Link href="#" className="text-sm text-text-secondary transition-colors hover:text-text-primary">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <span className="text-xs text-text-tertiary">
            &copy; 2026 KitFix. All rights reserved.
          </span>
          <span className="text-xs text-text-tertiary">
            Proudly South African
          </span>
        </div>
      </div>
    </footer>
  );
}
