import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
      variants: {
        variant: {
          default:
              "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
          secondary:
              "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
          destructive:
              "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
          outline: "text-foreground",
          // --- CÁC VARIANT MỚI ---
          success:
              "border-transparent bg-green-100 text-green-800 hover:bg-green-200", // Xanh lá nhẹ
          warning:
              "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200", // Vàng cam nhẹ
          info:
              "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200", // Xanh dương nhẹ
          ghost: "hover:bg-accent hover:text-accent-foreground",
          link: "text-primary underline-offset-4 hover:underline",
        },
      },
      defaultVariants: {
        variant: "default",
      },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {
  asChild?: boolean
}

function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot.Root : "div"
  return (
      <Comp className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }