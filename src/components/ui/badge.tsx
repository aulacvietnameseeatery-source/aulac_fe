import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-foreground",
                success: "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
                warning: "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
                info: "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",

                // --- CÁC VARIANT MỚI CHO RESERVATION (Dạng Soft/Pastel) ---
                "soft-secondary": "border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200", // PENDING
                "soft-success": "border-transparent bg-[#e7f7f0] text-[#0ab36c] hover:bg-[#d1f0e1]", // BOOKED
                "soft-purple": "border-transparent bg-[#f1eaff] text-[#6b35e8] hover:bg-[#e4d5ff]", // PAID / CHECKED IN
                "soft-danger": "border-transparent bg-[#fde8e8] text-[#f06548] hover:bg-[#fad1d1]", // CANCELLED
                "soft-warning": "border-transparent bg-[#fef4e4] text-[#f7b84b] hover:bg-[#fde6c2]", // NO SHOW
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