"use client";

import React, { useState } from "react";
import {
  Edit,
  RotateCcw,
  MoreHorizontal,
  Clock,
  Shield,
  Lock,
  Unlock,
  Copy,
  Check,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { dateUtils } from "@/lib/date-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PermissionGuard } from "@/components/permission-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { Permissions } from "@/types/const";
import { cn } from "@/lib/utils";
import { formatPhoneToDomesticDisplay } from "@/lib/phone-format";
import type { AccountDetail } from "../types/account-detail.types";

// ============================================================

const STATUS_BADGE_MAP: Record<
  string,
  { variant: "success" | "soft-secondary" | "destructive"; dotColor: string }
> = {
  ACTIVE: { variant: "success", dotColor: "bg-green-500" },
  INACTIVE: { variant: "soft-secondary", dotColor: "bg-gray-400" },
  LOCKED: { variant: "destructive", dotColor: "bg-red-500" },
};

// ============================================================

interface AccountProfileHeaderProps {
  account: AccountDetail;
  onEdit?: () => void;
  onResetPassword?: () => void;
  onStatusChange?: (status: string) => void;
}

export const AccountProfileHeader = ({
  account,
  onEdit,
  onResetPassword,
  onStatusChange,
}: AccountProfileHeaderProps) => {
  const t = useTranslations("Account.Detail.header");
  const tStatus = useTranslations("Account.Detail.statusLabel");
  const { userInfo } = useAuth();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const displayPhone = account.phone ? formatPhoneToDomesticDisplay(account.phone) : null;
  const currentUserId = userInfo?.userId ? Number(userInfo.userId) : null;
  const isCurrentUser = currentUserId !== null && currentUserId === account.accountId;

  // Initials for the avatar fallback
  const initials = account.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Manual relative time using Date.now() — same algorithm as notification-item
  const lastLoginText = (() => {
    if (!account.lastLoginAt) return t("neverLoggedIn");
    const diff = Date.now() - new Date(account.lastLoginAt).getTime();
    const sec = Math.floor(diff / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    if (sec < 60) return t("time.justNow");
    if (min < 60) return t("time.minutesAgo", { count: min });
    if (hr < 24) return t("time.hoursAgo", { count: hr });
    if (day < 7) return t("time.daysAgo", { count: day });
    return dateUtils.formatLocal(account.lastLoginAt, "dd/MM/yyyy HH:mm");
  })();

  const statusConfig = STATUS_BADGE_MAP[account.accountStatus] ?? STATUS_BADGE_MAP.INACTIVE;

  const handleCopy = async (text: string, fieldName: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 px-5 pt-5 pb-4 border-b border-gray-100 bg-linear-to-r from-slate-50/80 to-white">
      {/* Avatar */}
      <div className="shrink-0 w-14 h-14 rounded-full bg-[#1A3A52] flex items-center justify-center shadow-sm">
        <span className="text-lg font-semibold text-white tracking-wide">
          {initials}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {/* Name + Status */}
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold text-[#1A3A52] truncate">
            {account.fullName}
          </h2>
          <Badge variant={statusConfig.variant} className="text-[11px]">
            <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dotColor)} />
            {tStatus(account.accountStatus as "ACTIVE" | "INACTIVE" | "LOCKED")}
          </Badge>
          {account.isLocked && (
            <Badge variant="destructive" className="text-[11px]">
              <Lock size={10} />
              {t("locked")}
            </Badge>
          )}
        </div>

        {/* Role + meta */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Shield size={13} className="text-[#D5BA98]" />
            {account.role.roleName}
          </span>
          <span className="text-gray-300">|</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={13} className="text-gray-400" />
            {t("lastLogin")}: {lastLoginText}
          </span>
        </div>

        {/* Copyable fields */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {account.email && (
            <button
              type="button"
              onClick={() => handleCopy(account.email!, "email")}
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
            >
              {copiedField === "email" ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
              {account.email}
            </button>
          )}
          {account.phone && (
            <button
              type="button"
              onClick={() => handleCopy(displayPhone!, "phone")}
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
            >
              {copiedField === "phone" ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
              {displayPhone}
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="shrink-0 flex items-center gap-2 self-start">
        <PermissionGuard permission={Permissions.UpdateAccount}>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="text-xs"
          >
            <Edit size={13} className="mr-2"/>
            {t("edit")}
          </Button>
        </PermissionGuard>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <PermissionGuard permission={Permissions.ResetPassword}>
              <DropdownMenuItem onClick={onResetPassword}>
                <RotateCcw size={14} />
                {t("resetPassword")}
              </DropdownMenuItem>
            </PermissionGuard>

            <DropdownMenuSeparator />

            {/* Status change actions */}
            <PermissionGuard permission={Permissions.UpdateAccount}>
              {account.accountStatus !== "ACTIVE" && (
                <DropdownMenuItem onClick={() => onStatusChange?.("ACTIVE")}>
                  <Unlock size={14} className="text-green-600" />
                  {t("activate")}
                </DropdownMenuItem>
              )}
              {!isCurrentUser && account.accountStatus !== "INACTIVE" && (
                <DropdownMenuItem onClick={() => onStatusChange?.("INACTIVE")}>
                  <Lock size={14} className="text-gray-500" />
                  {t("deactivate")}
                </DropdownMenuItem>
              )}
              {account.accountStatus !== "LOCKED" && (
                <DropdownMenuItem
                  onClick={() => onStatusChange?.("LOCKED")}
                  variant="destructive"
                >
                  <Lock size={14} />
                  {t("lock")}
                </DropdownMenuItem>
              )}
            </PermissionGuard>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
