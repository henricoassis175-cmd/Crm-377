import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[7px] text-[13px] font-medium cursor-pointer select-none transition-[background-color,color,box-shadow,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 active:translate-y-px [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-ring-xs hover:bg-[#ad2154] hover:shadow-ring-sm",
        destructive:
          "bg-destructive text-destructive-foreground shadow-ring-xs hover:brightness-[0.94]",
        outline:
          "bg-card text-foreground shadow-ring-xs hover:bg-accent hover:shadow-ring-sm",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-accent",
        muted:
          "bg-secondary text-secondary-foreground hover:bg-accent",
        ghost:
          "bg-transparent text-foreground hover:bg-accent",
        text:
          "h-auto bg-transparent p-0 text-foreground hover:text-primary active:translate-y-0",
        link:
          "h-auto bg-transparent p-0 text-primary underline-offset-4 hover:underline active:translate-y-0",
      },
      size: {
        xxs: "h-5 px-1.5 text-[10px] [&_svg]:size-3",
        xs: "h-6 px-2 text-[11px] [&_svg]:size-3",
        sm: "h-7 px-2.5 text-[12px] [&_svg]:size-3.5",
        default: "h-8 px-3 [&_svg]:size-3.5",
        lg: "h-9 px-4 text-[13px] [&_svg]:size-4",
        icon: "size-8 p-0 [&_svg]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
