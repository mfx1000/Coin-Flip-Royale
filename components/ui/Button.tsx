import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils" // This will now be found

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 uppercase tracking-wider",
  {
    variants: {
      variant: {
        default:
          "bg-yellow-500 text-black hover:bg-yellow-500/90 shadow-[0_5px_15px_rgba(234,179,8,0.4)] transform-gpu transition-transform active:scale-95",
        destructive:
          "bg-red-600 text-white hover:bg-red-600/90 shadow-[0_5px_15px_rgba(220,38,38,0.4)]",
        outline:
          "border border-input bg-transparent hover:bg-slate-800 hover:text-slate-100",
        secondary:
          "bg-slate-800 text-slate-100 hover:bg-slate-700",
      },
      size: {
        default: "h-12 px-6 py-2 text-base",
        sm: "h-9 rounded-md px-3",
        lg: "h-14 rounded-md px-8 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// The interface for our button's props
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    // FIXED: This line is crucial. It extends the props to include all the
    // variants ('variant', 'size') defined in `buttonVariants` above.
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
