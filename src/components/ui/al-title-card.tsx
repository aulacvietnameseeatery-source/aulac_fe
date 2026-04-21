"use client";

import type { ReactNode } from "react";
import { ALCard, type ALCardProps } from "@/components/ui/al-card";
import { cn } from "@/lib/utils";

interface ALTitleCardProps extends Omit<ALCardProps, "children" | "title"> {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  bodyClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  actionsClassName?: string;
}

export function ALTitleCard({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
  headerClassName,
  titleClassName,
  descriptionClassName,
  actionsClassName,
  variant = "default",
  elevation = "sm",
  radius = "xl",
  ...props
}: ALTitleCardProps) {
  return (
    <ALCard
      variant={variant}
      elevation={elevation}
      radius={radius}
      className={cn("w-full px-4 py-4 sm:px-5", className)}
      {...props}
    >
      <div className={cn("flex w-full flex-col gap-4", bodyClassName)}>
        <div
          className={cn(
            "flex w-full flex-col gap-3 lg:flex-row lg:items-start lg:justify-between",
            headerClassName
          )}
        >
          <div className="min-w-0 w-full flex-1">
            <h1 className={cn("text-2xl font-semibold tracking-wide text-[#1A3A52]", titleClassName)}>
              {title}
            </h1>
            {description ? (
              <p className={cn("mt-1 text-sm text-[#1A3A52]/70", descriptionClassName)}>
                {description}
              </p>
            ) : null}
          </div>

          {actions ? (
            <div
              className={cn(
                "flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end lg:w-auto",
                actionsClassName
              )}
            >
              {actions}
            </div>
          ) : null}
        </div>

        {children ? <div className="flex w-full flex-col gap-3">{children}</div> : null}
      </div>
    </ALCard>
  );
}