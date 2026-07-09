"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wrench,
  PlusCircle,
  CreditCard,
  User,
  Bell,
  ShoppingBag,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";

const publicNavItems = [
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/repairs/new", label: "Start a Repair", icon: PlusCircle },
  { href: "/", label: "How It Works", icon: Hash },
];

const authNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/repairs", label: "My Repairs", icon: Wrench },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 bg-bg-deep border-border">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 font-display font-extrabold tracking-tight">
            <Image src="/logo.svg" alt="KitFix" width={16} height={16} className="h-4 w-auto" />
          </SheetTitle>
        </SheetHeader>

        {/* Public nav */}
        <div className="mt-6">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-2">
            Browse
          </p>
          <nav className="flex flex-col gap-1">
            {publicNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-green-bright/10 text-brand-green-bright"
                      : "text-text-secondary hover:bg-surface hover:text-text-primary",
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive && "text-brand-green-bright")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Auth nav */}
        <div className="mt-6">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-2">
            Your Account
          </p>
          <nav className="flex flex-col gap-1">
            {authNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-green-bright/10 text-brand-green-bright"
                      : "text-text-secondary hover:bg-surface hover:text-text-primary",
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive && "text-brand-green-bright")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Theme + Accent */}
        <div className="mt-8 flex items-center gap-4 border-t border-border pt-6 px-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-tertiary">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
