"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const footerColumns = [
  {
    label: "Services",
    links: [
      { label: "Jersey Repair", href: "#" },
      { label: "Customisation", href: "#" },
      { label: "Vintage Restoration", href: "#" },
      { label: "Bulk Team Orders", href: "#" },
    ],
  },
  {
    label: "Shop",
    links: [
      { label: "All Jerseys", href: "#" },
      { label: "Soccer", href: "#" },
      { label: "Rugby", href: "#" },
      { label: "Custom Blanks", href: "#" },
    ],
  },
  {
    label: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "How It Works", href: "#" },
      { label: "Track Repair", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

function FooterLink({ label, href }: { label: string; href: string }) {
  return (
    <motion.li className="group" whileHover={{ y: -2 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
      <Link href={href} className="relative inline-block text-xs text-text-tertiary transition-colors duration-300 hover:text-green-400">
        {label}
        <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-green-400/60 scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100" />
      </Link>
    </motion.li>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 relative">
      {/* Subtle green glow on top border */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-px"
        aria-hidden="true"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(0,232,89,0.15), transparent)",
        }}
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-2 gap-8 md:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {/* Brand column */}
          <motion.div className="col-span-2 md:col-span-1" variants={itemVariants}>
            <Link href="/" className="inline-flex">
              <Image src="/logo.svg" alt="KitFix" width={120} height={40} className="h-7 w-auto" />
            </Link>
            <p className="mt-3 max-w-xs text-xs text-text-tertiary leading-relaxed">
              South Africa&apos;s trusted jersey repair and customisation service.
            </p>
          </motion.div>

          {/* Link columns */}
          {footerColumns.map((column) => (
            <motion.div key={column.label} variants={itemVariants}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8 bg-green-400/40" />
                <h4 className="text-[10px] font-medium uppercase tracking-wider text-green-400/60">
                  {column.label}
                </h4>
              </div>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <FooterLink key={link.label} label={link.label} href={link.href} />
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/5 pt-5 sm:flex-row"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-[10px] text-text-tertiary tracking-wider">
            &copy; 2026 KitFix
          </span>
          <div className="flex items-center gap-3">
            <div className="h-px w-6 bg-green-400/30" />
            <span className="text-[10px] text-text-tertiary tracking-wider">
              Proudly South African
            </span>
            <div className="h-px w-6 bg-green-400/30" />
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
