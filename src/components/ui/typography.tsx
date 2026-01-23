import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const typographyVariants = cva(
    "text-navy-DEFAULT",
    {
        variants: {
            variant: {
                h1: "font-display text-4xl md:text-5xl font-bold tracking-tight",
                h2: "font-display text-3xl md:text-4xl font-bold",
                h3: "font-display text-2xl md:text-3xl font-semibold",
                h4: "font-display text-xl md:text-2xl font-medium",
                subtitle: "font-display text-sm md:text-base tracking-widest-xl uppercase text-gold-sand font-bold",
                body: "font-body text-base leading-relaxed text-navy-DEFAULT/80",
                small: "font-body text-sm font-medium leading-none",
                caption: "font-body text-xs text-gray-500",
            },
            color: {
                default: "text-navy-DEFAULT",
                white: "text-white",
                gold: "text-gold-classic",
                gray: "text-gray-500",
            },
        },
        defaultVariants: {
            variant: "body",
            color: "default",
        },
    }
);

export interface TypographyProps
    extends Omit<React.HTMLAttributes<HTMLHeadingElement>, "color">,
        VariantProps<typeof typographyVariants> {
    component?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
}

const Typography = React.forwardRef<HTMLHeadingElement, TypographyProps>(
    ({ className, variant, color, component, ...props }, ref) => {
        const Component = component ||
            (variant === "h1" ? "h1" :
                variant === "h2" ? "h2" :
                    variant === "h3" ? "h3" :
                        variant === "body" ? "p" : "span");

        return (
            <Component
                ref={ref}
                className={cn(typographyVariants({ variant, color, className }))}
                {...props}
            />
        );
    }
);
Typography.displayName = "Typography";

export { Typography, typographyVariants };