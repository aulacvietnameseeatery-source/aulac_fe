"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import type { RestaurantTable, TableStatus } from "../types";
import {
  TABLE_STATUS_CONFIG,
  TABLE_TYPE_LABELS,
  TABLE_ZONE_LABELS,
} from "../types";
import StatusBadge from "./status-badge";

interface TableDetailPanelProps {
  table: RestaurantTable | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (table: RestaurantTable) => void;
  onDelete: (table: RestaurantTable) => void;
  onStatusChange?: (tableId: number, status: TableStatus) => void;
}

const STATUS_ACTIONS: { status: TableStatus; label: string }[] = [
  { status: "AVAILABLE", label: "Available" },
  { status: "OCCUPIED", label: "Occupied" },
  { status: "RESERVED", label: "Reserved" },
  { status: "CLEANING", label: "Cleaning" },
  { status: "OUT_OF_SERVICE", label: "Out of Service" },
];

export const TableDetailPanel: React.FC<TableDetailPanelProps> = ({
  table,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  if (!table) return null;

  const config = TABLE_STATUS_CONFIG[table.status];

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()} direction="right">
      <DrawerContent className="h-full w-full max-w-md ml-auto rounded-none data-[vaul-drawer-direction=right]:sm:max-w-md">
        {/* Header */}
        <DrawerHeader className="border-b px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DrawerTitle className={cn("text-2xl font-bold", config.textColor)}>
                {table.tableCode}
              </DrawerTitle>
              <span
                className={cn(
                  "text-xs font-medium px-1.5 py-0.5 rounded",
                  table.isOnline
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-gray-100 text-gray-400"
                )}
              >
                {table.isOnline ? "Online" : "Offline"}
              </span>
            </div>
            <DrawerClose className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600" />
          </div>
          <DrawerDescription className="sr-only">
            Details for table {table.tableCode}
          </DrawerDescription>
          <div className="mt-2">
            <StatusBadge status={table.status} size="md" />
          </div>
        </DrawerHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Table image */}
          {table.image && (
            <div className="relative w-full h-44 rounded-lg overflow-hidden bg-gray-50">
              <Image
                src={table.image}
                alt={table.tableCode}
                fill
                className="object-cover"
                sizes="400px"
              />
            </div>
          )}

          {/* Details section */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Details
            </h5>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Zone" value={TABLE_ZONE_LABELS[table.zone]} />
              <InfoRow label="Type" value={TABLE_TYPE_LABELS[table.type]} />
              <InfoRow label="Capacity" value={`${table.capacity} seats`} />
              <InfoRow
                label="Connection"
                value={table.isOnline ? "Online" : "Offline"}
                valueClassName={
                  table.isOnline ? "text-emerald-600" : "text-gray-400"
                }
              />
            </div>
          </div>

          {/* Active Orders */}
          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Active Orders
            </h5>
            {table.activeOrders > 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                {table.activeOrders} active order
                {table.activeOrders > 1 ? "s" : ""} on this table
              </div>
            ) : (
              <p className="text-sm text-gray-400">No active orders</p>
            )}
          </div>

          {/* Error info */}
          {table.hasErrors && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Errors
              </h5>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                This table has reported errors that need attention.
              </div>
            </div>
          )}

          {/* QR Code */}
          {table.qrCodeUrl && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                QR Code
              </h5>
              <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center gap-2">
                <QrCode size={64} className="text-gray-600" />
                <span className="text-xs text-gray-400 break-all text-center">
                  {table.qrCodeUrl}
                </span>
              </div>
            </div>
          )}

          {/* Quick status change */}
          {onStatusChange && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Quick Status Change
              </h5>
              <div className="flex flex-wrap gap-2">
                {STATUS_ACTIONS.map((action) => {
                  const actionConf = TABLE_STATUS_CONFIG[action.status];
                  const isActive = table.status === action.status;
                  return (
                    <button
                      key={action.status}
                      disabled={isActive}
                      onClick={() =>
                        onStatusChange(table.tableId, action.status)
                      }
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full border transition-colors font-medium",
                        isActive
                          ? cn(
                              actionConf.bgColor,
                              actionConf.borderColor,
                              actionConf.textColor,
                              "cursor-default"
                            )
                          : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block w-1.5 h-1.5 rounded-full mr-1.5",
                          actionConf.dotColor
                        )}
                      />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <DrawerFooter className="border-t bg-gray-50 flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onEdit(table)}
          >
            <Pencil size={14} className="mr-1.5" />
            Edit
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => onDelete(table)}
          >
            <Trash2 size={14} className="mr-1.5" />
            Delete
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

function InfoRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className={cn("text-sm font-medium text-gray-700", valueClassName)}>
        {value}
      </p>
    </div>
  );
}

export default TableDetailPanel;
