"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  LayoutDashboard,
  Wrench,
  PlusCircle,
  CreditCard,
  User,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/repairs", label: "My Repairs", icon: Wrench },
  { href: "/repairs/new", label: "New Request", icon: PlusCircle },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

const navItemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

export function CustomerNav() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item, i) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <motion.div
            key={item.href}
            custom={i}
            variants={navItemVariants}
            initial={shouldReduceMotion ? "visible" : "hidden"}
            animate="visible"
            className="relative"
          >
            {isActive && (
              <motion.div
                layoutId="activeNav"
                className="absolute inset-0 rounded-md bg-primary/10"
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 30,
                }}
              />
            )}
            <Link
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-[color,background-color,transform] duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:translate-x-1 hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}
