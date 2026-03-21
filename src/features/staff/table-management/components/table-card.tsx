"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { MoreVertical, Pencil, Trash2, Eye } from "lucide-react";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";
import type { RestaurantTable, TableStatus } from "../types";
import { TABLE_STATUS_CONFIG, ALLOWED_TRANSITIONS, canTransitionTo } from "../types";
import StatusBadge from "./status-badge";

interface TableCardProps {
  table: RestaurantTable;
  onEdit: (table: RestaurantTable) => void;
  onDelete: (table: RestaurantTable) => void;
  onSelect?: (table: RestaurantTable) => void;
  onStatusChange?: (tableId: number, status: TableStatus) => void;
}

const ALL_STATUSES: TableStatus[] = ["AVAILABLE", "OCCUPIED", "RESERVED", "LOCKED"];

const TableCard: React.FC<TableCardProps> = ({
  table,
  onEdit,
  onDelete,
  onSelect,
  onStatusChange,
}) => {
  const t = useTranslations("tableManagement");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const updateMenuPos = useCallback(() => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 4,
        left: rect.right,
      });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const config = TABLE_STATUS_CONFIG[table.status];
  const isOffline = !table.isOnline;

  return (
    <div
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-lg border border border-[#D5BA98]/60 bg-white shadow-sm transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md",
        isOffline && "opacity-55"
      )}
      onClick={() => onSelect?.(table)}
    >
      <div className="p-4">
        {/* Top row: table code + context menu */}
        <div className="flex items-start justify-between mb-2">
        <div className="space-y-1">
          <span className={cn("text-lg font-bold leading-none", config.textColor)}>
            {table.tableCode}
          </span>
          <div className="flex items-center gap-1.5">
            <StatusBadge status={table.status} size="sm" />
            {isOffline && (
              <span className="rounded bg-[#D5BA98]/20 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[#1A3A52]/60">
                {t("filters.offline")}
              </span>
            )}
            {table.hasErrors && (
              <span className="rounded bg-[#8C3A3A]/12 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[#8C3A3A]">
                {t("states.error")}
              </span>
            )}
          </div>
        </div>

        {/* Context menu */}
        <div>
          <button
            ref={btnRef}
            className="rounded p-1 text-[#1A3A52]/40 opacity-0 transition-colors group-hover:opacity-100 hover:bg-[#D5BA98]/20 hover:text-[#1A3A52]"
            onClick={(e) => {
              e.stopPropagation();
              updateMenuPos();
              setMenuOpen((prev) => !prev);
            }}
          >
            <MoreVertical size={14} />
          </button>
          {menuOpen &&
            createPortal(
              <div
                ref={menuRef}
                className="fixed z-50 min-w-40 rounded-lg border border-[#D5BA98]/60 bg-[#FDFBF9] py-1 shadow-lg"
                style={{ top: menuPos.top, left: menuPos.left, transform: "translateX(-100%)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="flex w-full items-center px-3 py-2 text-sm text-[#1A3A52] transition-colors hover:bg-[#D5BA98]/15"
                  onClick={() => {
                    onSelect?.(table);
                    setMenuOpen(false);
                  }}
                >
                  <Eye size={14} className="mr-2 text-[#1A3A52]/55" />
                  {t("actions.viewDetails")}
                </button>
                <PermissionGuard permission={Permissions.EditTable}>
                  <button
                    className="flex w-full items-center px-3 py-2 text-sm text-[#1A3A52] transition-colors hover:bg-[#D5BA98]/15"
                    onClick={() => {
                      onEdit(table);
                      setMenuOpen(false);
                    }}
                  >
                    <Pencil size={14} className="mr-2 text-[#1A3A52]/55" />
                    {t("actions.edit")}
                  </button>
                </PermissionGuard>
                {onStatusChange && (
                  <PermissionGuard permission={Permissions.UpdateTableStatus}>
                    <>
                      <hr className="my-1 border-[#D5BA98]/35" />
                      {ALL_STATUSES
                        .filter((s) => s !== table.status && canTransitionTo(table.status, s))
                        .map((status) => {
                          const actionConf = TABLE_STATUS_CONFIG[status];
                          return (
                            <button
                              key={status}
                              className="flex w-full items-center px-3 py-1.5 text-xs text-[#1A3A52]/80 transition-colors hover:bg-[#D5BA98]/15"
                              onClick={() => {
                                onStatusChange(
                                  table.tableId,
                                  status
                                );
                                setMenuOpen(false);
                              }}
                            >
                              <span
                                className={cn(
                                  "w-2 h-2 rounded-full mr-2",
                                  actionConf.dotColor
                                )}
                              />
                              {t("actions.setStatus", { status: t(`status.${status.toLowerCase()}`) })}
                            </button>
                          );
                        })}
                    </>
                  </PermissionGuard>
                )}
                <hr className="my-1 border-[#D5BA98]/35" />
                <PermissionGuard permission={Permissions.DeleteTable}>
                  <button
                    className="flex w-full items-center px-3 py-2 text-sm text-[#8C3A3A] transition-colors hover:bg-[#8C3A3A]/10"
                    onClick={() => {
                      onDelete(table);
                      setMenuOpen(false);
                    }}
                  >
                    <Trash2 size={14} className="mr-2" />
                    {t("actions.delete")}
                  </button>
                </PermissionGuard>
              </div>,
              document.body
            )}
        </div>
      </div>

      {/* Bottom meta row */}
      <div className="flex items-center justify-between border-t border-[#D5BA98]/35 pt-2 text-[11px] text-[#1A3A52]/60">
        <span>{t("zone.seatsCount", { count: table.capacity })}</span>
        <span
          className={cn(
            "font-medium",
            table.typeName === "VIP" ? "text-[#4A5D4E]" : "text-[#1A3A52]/75"
          )}
        >
          {table.typeName}
        </span>
      </div>

      {/* Active orders line */}
      {table.activeOrders > 0 && (
        <p className="mt-1.5 text-[10px] text-[#1A3A52]/65">
          {t("detail.activeOrdersCount", { count: table.activeOrders })}
        </p>
      )}
      </div>{/* end p-3.5 wrapper */}

      {/* Left accent bar */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-0.5 rounded-full",
          config.dotColor
        )}
      />
    </div>
  );
};

export default TableCard;
