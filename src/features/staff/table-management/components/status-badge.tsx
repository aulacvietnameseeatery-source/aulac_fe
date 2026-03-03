"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { TableStatus } from "../types";
import { TABLE_STATUS_CONFIG } from "../types";

// Map table status to Badge variant
const STATUS_VARIANT: Record<TableStatus, "success" | "destructive" | "warning" | "info" | "secondary"> = {
  AVAILABLE: "success",
  OCCUPIED: "destructive",
  RESERVED: "warning",
  LOCKED: "secondary",
};

interface StatusBadgeProps {
  status: TableStatus;
  size?: "sm" | "md";
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "sm",
  showDot = true,
  className,
}) => {
  const config = TABLE_STATUS_CONFIG[status];
  const variant = STATUS_VARIANT[status] ?? "secondary";

  if (!config) {
    return (
      <Badge variant="secondary" className={className}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge
      variant={variant}
      className={cn(
        "gap-1.5",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            "inline-block rounded-full shrink-0",
            config.dotColor,
            size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2"
          )}
        />
      )}
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
