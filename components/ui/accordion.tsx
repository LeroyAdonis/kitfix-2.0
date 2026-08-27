"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

function Accordion({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root> & {
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  type?: "single" | "multiple";
}) {
  return (
    <AccordionPrimitive.Root data-slot="accordion" className={cn(className)} {...props}>
      {children}
    </AccordionPrimitive.Root>
  );
}

function AccordionItem({
  className,
  children,
  value,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item> & {
  className?: string;
  children: React.ReactNode;
  value: string;
}) {
  return (
    <AccordionPrimitive.Item
      value={value}
      data-slot="accordion-item"
      className={cn(
        "border-b border-[var(--color-pitch-line)]/50 first:border-t",
        className,
      )}
      {...props}
    >
      {children}
    </AccordionPrimitive.Item>
  );
}

function AccordionTrigger({
  className,
  children,
  icon = (
    <ChevronDown className="size-6 shrink-0 text-[var(--color-stitch)] transition-transform duration-300 md:size-7" />
  ),
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
  className?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <AccordionPrimitive.Header className="flex w-full">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-bold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-stitch)] [&[data-state=open]>svg]:rotate-180",
          className,
        )}
        {...props}
      >
        {children}
        {icon}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content> & {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden text-[var(--color-thread-dim)] data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("pb-5", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };