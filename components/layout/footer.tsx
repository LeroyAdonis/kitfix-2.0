import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex">
              <Image src="/logo.svg" alt="KitFix" width={16} height={16} className="h-4 w-auto" />
            </Link>
            <p className="mt-3 max-w-xs text-xs text-text-tertiary leading-relaxed">
              South Africa&apos;s trusted jersey repair and customisation service.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Services</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-xs text-text-tertiary transition-colors hover:text-text-primary">Jersey Repair</Link></li>
              <li><Link href="#" className="text-xs text-text-tertiary transition-colors hover:text-text-primary">Customisation</Link></li>
              <li><Link href="#" className="text-xs text-text-tertiary transition-colors hover:text-text-primary">Vintage Restoration</Link></li>
              <li><Link href="#" className="text-xs text-text-tertiary transition-colors hover:text-text-primary">Bulk Team Orders</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Shop</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-xs text-text-tertiary transition-colors hover:text-text-primary">All Jerseys</Link></li>
              <li><Link href="#" className="text-xs text-text-tertiary transition-colors hover:text-text-primary">Soccer</Link></li>
              <li><Link href="#" className="text-xs text-text-tertiary transition-colors hover:text-text-primary">Rugby</Link></li>
              <li><Link href="#" className="text-xs text-text-tertiary transition-colors hover:text-text-primary">Custom Blanks</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Company</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-xs text-text-tertiary transition-colors hover:text-text-primary">About Us</Link></li>
              <li><Link href="#" className="text-xs text-text-tertiary transition-colors hover:text-text-primary">How It Works</Link></li>
              <li><Link href="#" className="text-xs text-text-tertiary transition-colors hover:text-text-primary">Track Repair</Link></li>
              <li><Link href="#" className="text-xs text-text-tertiary transition-colors hover:text-text-primary">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-border pt-5 sm:flex-row">
          <span className="text-[10px] text-text-tertiary tracking-wider">
            &copy; 2026 KitFix
          </span>
          <span className="text-[10px] text-text-tertiary tracking-wider">
            Proudly South African
          </span>
        </div>
      </div>
    </footer>
  );
}
