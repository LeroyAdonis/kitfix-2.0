"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatusTrackerProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

function AnimatedCheckmark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-3.5 w-3.5 text-primary-foreground"
    >
      <motion.path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
      />
    </svg>
  );
}

export function StatusTracker({
  steps,
  currentStep,
  className,
}: StatusTrackerProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={cn("w-full", className)}
      data-slot="status-tracker"
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={0}
      aria-valuemax={steps.length - 1}
    >
      {/* Horizontal layout (md+) */}
      <div className="hidden md:block">
        <div className="flex items-center">
          {steps.map((step, i) => {
            const isCompleted = i < currentStep;
            const isCurrent = i === currentStep;
            const isFuture = i > currentStep;

            return (
              <div key={step} className="flex flex-1 items-center last:flex-initial">
                {/* Step circle */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    {/* Pulsing ring for current step */}
                    {isCurrent && !shouldReduceMotion && (
                      <motion.div
                        className="absolute -inset-1.5 rounded-full border-2 border-primary"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}

                    <motion.div
                      className={cn(
                        "relative flex items-center justify-center rounded-full",
                        isCompleted &&
                          "h-8 w-8 bg-primary text-primary-foreground",
                        isCurrent &&
                          "h-8 w-8 border-2 border-primary bg-primary/10",
                        isFuture &&
                          "h-6 w-6 border-2 border-muted-foreground/30 bg-muted",
                      )}
                      initial={
                        shouldReduceMotion
                          ? false
                          : { scale: 0, opacity: 0 }
                      }
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        delay: shouldReduceMotion ? 0 : i * 0.1,
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      {isCompleted && <AnimatedCheckmark />}
                      {isCurrent && (
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                      )}
                    </motion.div>
                  </div>

                  <motion.span
                    className={cn(
                      "whitespace-nowrap text-xs font-medium",
                      isCompleted && "text-primary",
                      isCurrent && "text-foreground",
                      isFuture && "text-muted-foreground",
                    )}
                    initial={
                      shouldReduceMotion
                        ? false
                        : { opacity: 0, y: 8 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: shouldReduceMotion ? 0 : i * 0.1 + 0.15,
                      duration: 0.3,
                    }}
                  >
                    {step}
                  </motion.span>
                </div>

                {/* Connecting line */}
                {i < steps.length - 1 && (
                  <div className="relative mx-2 h-0.5 flex-1 self-start mt-4 bg-muted-foreground/20">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-primary"
                      initial={shouldReduceMotion ? false : { width: "0%" }}
                      animate={{
                        width: isCompleted ? "100%" : isCurrent ? "50%" : "0%",
                      }}
                      transition={{
                        delay: shouldReduceMotion ? 0 : i * 0.1 + 0.05,
                        duration: shouldReduceMotion ? 0 : 0.5,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Vertical layout (mobile) */}
      <div className="block md:hidden">
        <div className="flex flex-col gap-0">
          {steps.map((step, i) => {
            const isCompleted = i < currentStep;
            const isCurrent = i === currentStep;
            const isFuture = i > currentStep;

            return (
              <div key={step} className="flex items-start gap-3">
                {/* Left column: circle + line */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    {isCurrent && !shouldReduceMotion && (
                      <motion.div
                        className="absolute -inset-1.5 rounded-full border-2 border-primary"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}

                    <motion.div
                      className={cn(
                        "relative flex items-center justify-center rounded-full",
                        isCompleted &&
                          "h-8 w-8 bg-primary text-primary-foreground",
                        isCurrent &&
                          "h-8 w-8 border-2 border-primary bg-primary/10",
                        isFuture &&
                          "h-6 w-6 border-2 border-muted-foreground/30 bg-muted",
                      )}
                      initial={
                        shouldReduceMotion
                          ? false
                          : { scale: 0, opacity: 0 }
                      }
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        delay: shouldReduceMotion ? 0 : i * 0.1,
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      {isCompleted && <AnimatedCheckmark />}
                      {isCurrent && (
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                      )}
                    </motion.div>
                  </div>

                  {/* Vertical connecting line */}
                  {i < steps.length - 1 && (
                    <div className="relative h-8 w-0.5 bg-muted-foreground/20">
                      <motion.div
                        className="absolute inset-x-0 top-0 bg-primary"
                        initial={shouldReduceMotion ? false : { height: "0%" }}
                        animate={{
                          height: isCompleted
                            ? "100%"
                            : isCurrent
                              ? "50%"
                              : "0%",
                        }}
                        transition={{
                          delay: shouldReduceMotion ? 0 : i * 0.1 + 0.05,
                          duration: shouldReduceMotion ? 0 : 0.5,
                          ease: "easeOut",
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Right column: label */}
                <motion.span
                  className={cn(
                    "pt-1 text-sm font-medium",
                    isCompleted && "text-primary",
                    isCurrent && "text-foreground",
                    isFuture && "text-muted-foreground",
                  )}
                  initial={
                    shouldReduceMotion
                      ? false
                      : { opacity: 0, x: -12 }
                  }
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: shouldReduceMotion ? 0 : i * 0.1 + 0.15,
                    duration: 0.3,
                  }}
                >
                  {step}
                </motion.span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
