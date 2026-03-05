import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const spinnerVariants = cva(
  "inline-block animate-spin rounded-full border-current/20 border-t-current",
  {
    variants: {
      size: {
        xs: "size-3 border",
        sm: "size-4 border-[1.5px]",
        md: "size-5 border-2",
        lg: "size-8 border-[3px]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

function Spinner({
  className,
  size,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof spinnerVariants>) {
  return (
    <div
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn(spinnerVariants({ size }), className)}
      {...props}
    >
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export { Spinner, spinnerVariants };
