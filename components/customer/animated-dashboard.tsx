"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Wrench, Package, CheckCircle2, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RepairCard } from "@/components/repair/repair-card";
import { EmptyState } from "@/components/shared/empty-state";
import { AnimatedText, AnimatedCounter, ScrollReveal } from "@/components/motion";
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
        <AnimatedText
          text={`Welcome back, ${userName}!`}
          as="h1"
          className="text-2xl font-bold"
        />
        <motion.p
          className="text-muted-foreground"
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
            <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={statsValues[stat.key]} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent repairs */}
      <div>
        <ScrollReveal>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Repairs</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/repairs">View All</Link>
            </Button>
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
