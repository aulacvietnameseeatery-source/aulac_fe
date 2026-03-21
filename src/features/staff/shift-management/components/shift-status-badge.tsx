"use client";

import { Badge } from "@/components/ui/badge";
import {
  ATTENDANCE_STATUS_CONFIG,
  ASSIGNMENT_STATUS_CONFIG,
} from "../types/shift-management.types";

interface StatusBadgeProps {
  statusCode: string;
  type?: "attendance" | "schedule" | "assignment";
}

function badgeClassByCode(statusCode: string, type: "attendance" | "schedule" | "assignment") {
  const code = statusCode.toUpperCase();

  if (type === "assignment") {
    if (code === "DRAFT") return "border-amber-500 bg-amber-500 text-white shadow-sm";
    if (code === "ASSIGNED") return "border-blue-500 bg-blue-500 text-white shadow-sm";
    if (code === "CONFIRMED") return "border-emerald-500 bg-emerald-500 text-white shadow-sm";
    if (code === "CANCELLED") return "border-red-500 bg-red-500 text-white shadow-sm";
    // Legacy
    if (code === "ACTIVE") return "border-emerald-500 bg-emerald-500 text-white shadow-sm";
    return "border-slate-600 bg-slate-600 text-white shadow-sm";
  }

  if (code === "LATE" || code === "EARLY_LEAVE") return "border-amber-500 bg-amber-500 text-white shadow-sm";
  if (code === "ACTIVE" || code === "ON_DUTY") return "border-blue-500 bg-blue-500 text-white shadow-sm";
  if (code === "COMPLETED") return "border-emerald-500 bg-emerald-500 text-white shadow-sm";
  if (code === "ABSENT") return "border-red-500 bg-red-500 text-white shadow-sm";
  if (code === "SCHEDULED" || code === "EXCUSED") return "border-slate-600 bg-slate-600 text-white shadow-sm";
  return "border-slate-600 bg-slate-600 text-white shadow-sm";
}

export function ShiftStatusBadge({ statusCode, type = "attendance" }: StatusBadgeProps) {
  const configMap =
    type === "attendance" ? ATTENDANCE_STATUS_CONFIG : ASSIGNMENT_STATUS_CONFIG;

  const config = configMap[statusCode] ?? configMap[statusCode.toLowerCase()];

  if (!config) {
    return (
      <Badge variant="outline" className={`font-semibold ${badgeClassByCode(statusCode, type)}`}>
        {statusCode}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={`font-semibold ${badgeClassByCode(statusCode, type)}`}>
      {config.label}
    </Badge>
  );
}
