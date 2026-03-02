"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

const TAGS = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  p: "p",
  span: "span",
} as const;

type TagName = keyof typeof TAGS;

interface GradientTextProps {
  children: ReactNode;
  as?: TagName;
  className?: string;
}

export function GradientText({
  children,
  as = "span",
  className,
}: GradientTextProps) {
  const Tag = TAGS[as];

  return (
    <Tag
      className={cn(
        "animate-gradient-shift bg-gradient-to-r from-primary via-secondary to-accent bg-[length:200%_auto] bg-clip-text text-transparent",
        className
      )}
      data-slot="gradient-text"
    >
      {children}
    </Tag>
  );
}
