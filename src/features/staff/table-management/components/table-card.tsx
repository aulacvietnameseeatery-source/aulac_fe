"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { MoreVertical, Pencil, Trash2, Eye } from "lucide-react";
import type { RestaurantTable, TableStatus } from "../types";
import { TABLE_STATUS_CONFIG, TABLE_TYPE_LABELS } from "../types";
import StatusBadge from "./status-badge";

interface TableCardProps {
  table: RestaurantTable;
  onEdit: (table: RestaurantTable) => void;
  onDelete: (table: RestaurantTable) => void;
  onSelect?: (table: RestaurantTable) => void;
  onStatusChange?: (tableId: number, status: TableStatus) => void;
}

const STATUS_QUICK_ACTIONS: { status: TableStatus; label: string }[] = [
  { status: "AVAILABLE", label: "Set Available" },
  { status: "OCCUPIED", label: "Set Occupied" },
  { status: "RESERVED", label: "Set Reserved" },
  { status: "CLEANING", label: "Set Cleaning" },
  { status: "OUT_OF_SERVICE", label: "Out of Service" },
];

const TableCard: React.FC<TableCardProps> = ({
  table,
  onEdit,
  onDelete,
  onSelect,
  onStatusChange,
}) => {
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
        "relative rounded-lg border bg-white overflow-hidden transition-all duration-200 cursor-pointer group",
        "hover:shadow-md",
        config.borderColor,
        isOffline && "opacity-55"
      )}
      onClick={() => onSelect?.(table)}
    >
      {/* Table image */}
      {table.image && (
        <div className="relative w-full h-28 bg-gray-50">
          <Image
            src={table.image}
            alt={table.tableCode}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 240px"
          />
        </div>
      )}

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
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 uppercase tracking-wide">
                Offline
              </span>
            )}
            {table.hasErrors && (
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-orange-50 text-orange-500 uppercase tracking-wide">
                Error
              </span>
            )}
          </div>
        </div>

        {/* Context menu */}
        <div>
          <button
            ref={btnRef}
            className="p-1 rounded text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
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
                className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 min-w-40"
                style={{ top: menuPos.top, left: menuPos.left, transform: "translateX(-100%)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    onSelect?.(table);
                    setMenuOpen(false);
                  }}
                >
                  <Eye size={14} className="mr-2 text-gray-400" />
                  View Details
                </button>
                <button
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    onEdit(table);
                    setMenuOpen(false);
                  }}
                >
                  <Pencil size={14} className="mr-2 text-gray-400" />
                  Edit
                </button>
                {onStatusChange && (
                  <>
                    <hr className="my-1 border-gray-100" />
                    {STATUS_QUICK_ACTIONS.filter((a) => a.status !== table.status).map(
                      (action) => {
                        const actionConf = TABLE_STATUS_CONFIG[action.status];
                        return (
                          <button
                            key={action.status}
                            className="flex items-center w-full px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                            onClick={() => {
                              onStatusChange(table.tableId, action.status);
                              setMenuOpen(false);
                            }}
                          >
                            <span
                              className={cn(
                                "w-2 h-2 rounded-full mr-2",
                                actionConf.dotColor
                              )}
                            />
                            {action.label}
                          </button>
                        );
                      }
                    )}
                  </>
                )}
                <hr className="my-1 border-gray-100" />
                <button
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  onClick={() => {
                    onDelete(table);
                    setMenuOpen(false);
                  }}
                >
                  <Trash2 size={14} className="mr-2" />
                  Delete
                </button>
              </div>,
              document.body
            )}
        </div>
      </div>

      {/* Bottom meta row */}
      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-50">
        <span>{table.capacity} seats</span>
        <span
          className={cn(
            "font-medium",
            table.type === "VIP" ? "text-amber-600" : "text-gray-500"
          )}
        >
          {TABLE_TYPE_LABELS[table.type]}
        </span>
      </div>

      {/* Active orders line */}
      {table.activeOrders > 0 && (
        <p className="text-[10px] text-gray-400 mt-1.5">
          {table.activeOrders} active order{table.activeOrders > 1 ? "s" : ""}
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
