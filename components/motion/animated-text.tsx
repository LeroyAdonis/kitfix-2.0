"use client";

import { useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils";

const TAGS = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  p: "p",
  span: "span",
} as const;

type TagName = keyof typeof TAGS;

interface AnimatedTextProps {
  text: string;
  as?: TagName;
  delay?: number;
  stagger?: number;
  className?: string;
}

const containerVariants: Variants = {
  hidden: {},
  visible: (stagger: number) => ({
    transition: {
      staggerChildren: stagger,
    },
  }),
};

const wordVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export function AnimatedText({
  text,
  as = "p",
  delay = 0,
  stagger = 0.05,
  className,
}: AnimatedTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const shouldReduceMotion = useReducedMotion();

  const Tag = TAGS[as];
  const words = text.split(" ");

  if (shouldReduceMotion) {
    return (
      <Tag className={className} data-slot="animated-text">
        {text}
      </Tag>
    );
  }

  return (
    <Tag className={cn("flex flex-wrap", className)} data-slot="animated-text">
      <motion.span
        ref={ref}
        className="flex flex-wrap"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        custom={stagger}
        transition={{ delayChildren: delay }}
      >
        {words.map((word, i) => (
          <motion.span
            key={`${word}-${i}`}
            className="mr-[0.25em] inline-block"
            variants={wordVariants}
          >
            {word}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}
