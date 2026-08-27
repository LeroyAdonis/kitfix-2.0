import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-3 whitespace-nowrap font-bold uppercase tracking-wide transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-stitch)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border border-[var(--color-stitch)] bg-[var(--color-stitch)] text-[var(--color-ink)] hover:brightness-110",
        alternate:
          "border border-[var(--color-thread)] bg-[var(--color-thread)] text-[var(--color-ink)] hover:brightness-95",
        secondary:
          "border border-[var(--color-pitch-line)] bg-transparent text-[var(--color-thread)] hover:border-[var(--color-stitch)]/60 hover:text-[var(--color-stitch)]",
        "secondary-alt":
          "border border-[var(--color-thread)] text-[var(--color-thread)] hover:border-[var(--color-stitch)] hover:text-[var(--color-stitch)]",
        link: "gap-2 text-[var(--color-stitch)] hover:underline",
        "link-alt": "gap-2 text-[var(--color-thread)] hover:text-[var(--color-stitch)]",
        ghost: "hover:bg-[var(--color-pitch)] hover:text-[var(--color-thread)]",
        none: "",
      },
      size: {
        default: "px-8 py-4",
        sm: "px-5 py-2.5",
        link: "p-0",
        icon: "size-10",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    iconLeft?: React.ReactNode;
    iconRight?: React.ReactNode;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  iconLeft,
  iconRight,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {iconLeft && iconLeft}
      <Slottable>{children}</Slottable>
      {iconRight && iconRight}
    </Comp>
  );
}

export { Button, buttonVariants };
export type { ButtonProps };