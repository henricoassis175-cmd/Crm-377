import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring/20",
  {
    variants: {
      variant: {
        default: "border-primary/15 bg-primary/10 text-primary hover:bg-primary/15",
        secondary:
          "border-border bg-secondary text-secondary-foreground hover:bg-accent",
        destructive:
          "border-destructive/15 bg-destructive/10 text-destructive hover:bg-destructive/15",
        outline: "border-border bg-surface text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };