import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react"; // Icon loading xoay xoay
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-navy-DEFAULT text-white hover:bg-navy-header",
                primary: "bg-orange-DEFAULT text-navy-DEFAULT hover:bg-orange-DEFAULT/90 font-bold", // Nút cam (Reserve)
                outline: "border border-navy-DEFAULT bg-transparent hover:bg-navy-DEFAULT/10 text-navy-DEFAULT", // Nút viền
                ghost: "hover:bg-slate-100 hover:text-slate-900", // Nút trong suốt
                link: "text-navy-DEFAULT underline-offset-4 hover:underline", // Nút link
                gold: "bg-gold-classic text-white hover:bg-gold-classic/90", // Nút vàng
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, isLoading, children, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };