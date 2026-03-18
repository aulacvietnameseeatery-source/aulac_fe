"use client";

import React, { createElement, useState } from "react";
import { cn } from "@/lib/utils";

export type ALCardPadding = "none" | "sm" | "md" | "lg";
export type ALCardVariant = "default" | "soft" | "tinted" | "glass" | "outline";
export type ALCardElevation = "none" | "sm" | "md" | "lg";
export type ALCardAnimation = "none" | "fade" | "slide-up";
export type ALCardHoverEffect = "none" | "lift" | "scale" | "glow";
export type ALCardRadius = "md" | "lg" | "xl" | "2xl";

export interface ALCardRenderState {
  isHovered: boolean;
}

export interface ALCardProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  as?: "div" | "section" | "article";
  padding?: ALCardPadding;
  variant?: ALCardVariant;
  elevation?: ALCardElevation;
  radius?: ALCardRadius;
  animation?: ALCardAnimation;
  hoverEffect?: ALCardHoverEffect;
  hoverable?: boolean; // Backward-compatible alias for hoverEffect
  animated?: boolean; // Backward-compatible alias for animation
  borderClassName?: string;
  backgroundClassName?: string;
  shadowClassName?: string;
  withHoverState?: boolean;
  children: React.ReactNode | ((state: ALCardRenderState) => React.ReactNode);
}

const PADDING_CLASS: Record<ALCardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

const VARIANT_CLASS: Record<ALCardVariant, string> = {
  default: "border-[#D5BA98]/60 bg-white",
  soft: "border-slate-200 bg-white",
  tinted: "border-[#D5BA98]/50 bg-[#FDFBF9]",
  glass: "border-white/50 bg-white/70 backdrop-blur-sm",
  outline: "border-[#D5BA98]/70 bg-transparent",
};

const ELEVATION_CLASS: Record<ALCardElevation, string> = {
  none: "shadow-none",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
};

const RADIUS_CLASS: Record<ALCardRadius, string> = {
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
};

const ANIMATION_CLASS: Record<ALCardAnimation, string> = {
  none: "",
  fade: "animate-in fade-in duration-200",
  "slide-up": "animate-in fade-in slide-in-from-bottom-1 duration-200",
};

const HOVER_EFFECT_CLASS: Record<ALCardHoverEffect, string> = {
  none: "",
  lift: "hover:-translate-y-0.5 hover:shadow-md",
  scale: "hover:scale-[1.01] hover:shadow-md",
  glow: "hover:shadow-[0_0_0_1px_rgba(213,186,152,0.8),0_10px_24px_rgba(26,58,82,0.08)]",
};

export function ALCard({
  as = "div",
  padding = "none",
  variant = "default",
  elevation = "sm",
  radius = "xl",
  animation = "none",
  hoverEffect = "none",
  hoverable = false,
  animated = true,
  borderClassName,
  backgroundClassName,
  shadowClassName,
  withHoverState = false,
  className,
  children,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ALCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const resolvedHoverEffect: ALCardHoverEffect = hoverable ? "lift" : hoverEffect;
  const resolvedAnimation: ALCardAnimation = !animated ? "none" : animation;

  const resolvedChildren =
    typeof children === "function"
      ? (children as (state: ALCardRenderState) => React.ReactNode)({ isHovered })
      : children;

  return createElement(
    as,
    {
      onMouseEnter: (event: React.MouseEvent<HTMLElement>) => {
        if (withHoverState) setIsHovered(true);
        onMouseEnter?.(event);
      },
      onMouseLeave: (event: React.MouseEvent<HTMLElement>) => {
        if (withHoverState) setIsHovered(false);
        onMouseLeave?.(event);
      },
      className: cn(
        "border transition-all",
        RADIUS_CLASS[radius],
        VARIANT_CLASS[variant],
        ELEVATION_CLASS[elevation],
        borderClassName,
        backgroundClassName,
        shadowClassName,
        PADDING_CLASS[padding],
        ANIMATION_CLASS[resolvedAnimation],
        HOVER_EFFECT_CLASS[resolvedHoverEffect],
        className
      ),
      ...props,
    },
    resolvedChildren
  );
}
