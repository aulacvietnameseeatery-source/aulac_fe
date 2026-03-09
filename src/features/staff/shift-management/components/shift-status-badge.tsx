"use client";

import { Badge } from "@/components/ui/badge";
import {
  ATTENDANCE_STATUS_CONFIG,
  SCHEDULE_STATUS_CONFIG,
  ASSIGNMENT_STATUS_CONFIG,
} from "../types/shift-management.types";

interface StatusBadgeProps {
  statusCode: string;
  type?: "attendance" | "schedule" | "assignment";
}

export function ShiftStatusBadge({ statusCode, type = "attendance" }: StatusBadgeProps) {
  const configMap =
    type === "attendance"
      ? ATTENDANCE_STATUS_CONFIG
      : type === "schedule"
        ? SCHEDULE_STATUS_CONFIG
        : ASSIGNMENT_STATUS_CONFIG;

  const config = configMap[statusCode];

  if (!config) {
    return <Badge variant="secondary">{statusCode}</Badge>;
  }

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
