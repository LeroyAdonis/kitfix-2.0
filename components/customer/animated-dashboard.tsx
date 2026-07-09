"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Wrench, Package, CheckCircle2, PlusCircle } from "lucide-react";
import { RepairCard } from "@/components/repair/repair-card";
import { EmptyState } from "@/components/shared/empty-state";
import { AnimatedText, AnimatedCounter, ScrollReveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import type { RepairRequest, RepairPhoto } from "@/lib/db/schema";

type RepairWithPhotos = RepairRequest & { photos: RepairPhoto[] };

interface AnimatedDashboardProps {
  userName: string;
  totalRepairs: number;
  activeRepairs: number;
  completedRepairs: number;
  recentRepairs: RepairWithPhotos[];
}

const statsCardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

const repairItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

const STATS = [
  { key: "total", label: "Total Repairs", icon: Wrench },
  { key: "active", label: "Active", icon: Package },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
] as const;

export function AnimatedDashboard({
  userName,
  totalRepairs,
  activeRepairs,
  completedRepairs,
  recentRepairs,
}: AnimatedDashboardProps) {
  const shouldReduceMotion = useReducedMotion();

  const statsValues: Record<(typeof STATS)[number]["key"], number> = {
    total: totalRepairs,
    active: activeRepairs,
    completed: completedRepairs,
  };

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-green-400/40" />
          <p className="text-[10px] font-semibold tracking-[0.3em] text-green-400 uppercase">Dashboard</p>
        </div>
        <AnimatedText
          text={`Welcome back, ${userName}!`}
          as="h1"
          className="font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl"
        />
        <motion.p
          className="mt-1 text-sm text-text-secondary"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          Here&apos;s an overview of your jersey repairs.
        </motion.p>
      </div>

      {/* Stats cards with stagger */}
      <div className="grid gap-4 sm:grid-cols-3">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.key}
            custom={i}
            variants={statsCardVariants}
            initial={shouldReduceMotion ? "visible" : "hidden"}
            animate="visible"
          >
            <div className="group rounded-xl border border-white/[0.04] bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-green-400/20 hover:shadow-[0_0_30px_rgba(0,232,89,0.04)]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
                  {stat.label}
                </p>
                <stat.icon className="h-4 w-4 text-text-tertiary transition-colors duration-300 group-hover:text-green-400" aria-hidden="true" />
              </div>
              <div className="font-display text-3xl font-bold text-text-primary">
                <AnimatedCounter value={statsValues[stat.key]} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent repairs */}
      <div>
        <ScrollReveal>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-text-primary">Recent Repairs</h2>
            <Link
              href="/repairs"
              className="text-xs font-semibold tracking-[0.15em] text-green-400 uppercase transition-colors hover:text-green-400/80"
            >
              View All
            </Link>
          </div>
        </ScrollReveal>

        {recentRepairs.length > 0 ? (
          <div className="space-y-3">
            {recentRepairs.map((repair, i) => (
              <motion.div
                key={repair.id}
                custom={i}
                variants={repairItemVariants}
                initial={shouldReduceMotion ? "visible" : "hidden"}
                animate="visible"
              >
                <RepairCard repair={repair} />
              </motion.div>
            ))}
          </div>
        ) : (
          <ScrollReveal delay={0.2}>
            <EmptyState
              icon={<Wrench className="h-10 w-10" aria-hidden="true" />}
              title="No repairs yet"
              description="Submit your first jersey repair request to get started."
              action={
                <Button asChild>
                  <Link href="/repairs/new">
                    <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                    New Repair Request
                  </Link>
                </Button>
              }
            />
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
